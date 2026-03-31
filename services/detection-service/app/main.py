import cv2
import time
import asyncio
import numpy as np
import supervision as sv
from typing import Optional
from dataclasses import dataclass
from fastapi import FastAPI
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.logger import logger
from app.models.yolo_model import yolo_model
from app.services.tracking import tracking_service
from app.services.behavior import behavior_service
from app.services.kafka_producer import kafka_producer
from app.schemas.detection import DetectionResult
from app.api.routes import router

FRAME_SLEEP = 1.0 / 15.0  # 15 fps limit

def process_frame_sync(app: FastAPI):
    """Synchronous CV loop running in thread executor."""
    cap = cv2.VideoCapture(settings.CAMERA_INDEX)
    if not cap.isOpened():
        logger.error(f"Could not open camera {settings.CAMERA_INDEX}")
        app.state.camera_connected = False
        return

    app.state.camera_connected = True
    
    # Supervision Annotators
    box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator()
    
    frame_count = 0
    
    while app.state.is_running:
        start_time = time.time()
        
        try:
            ret, frame = cap.read()
            if not ret:
                logger.warning("Failed to read frame")
                time.sleep(1)
                # Attempt to release and reconnect
                cap.release()
                cap = cv2.VideoCapture(settings.CAMERA_INDEX)
                continue

            # Run detection
            results = yolo_model.model(frame, classes=yolo_model.filter_classes, verbose=False, conf=settings.CONFIDENCE_THRESHOLD)[0]
            detections = sv.Detections.from_ultralytics(results)
            
            # Tracker update
            tracked_detections = tracking_service.track(detections)
            current_time = time.time()
            
            active_ids = []
            labels = []
            
            # Process tracked objects
            for i, tracker_id in enumerate(tracked_detections.tracker_id):
                active_ids.append(tracker_id)
                bbox = tracked_detections.xyxy[i].tolist()
                bbox_int = [int(v) for v in bbox]
                conf = tracked_detections.confidence[i]
                
                behavior = behavior_service.get_behavior_label(tracker_id, bbox_int, current_time)
                
                # Build scheme
                det_result = DetectionResult(
                    track_id=tracker_id,
                    bbox=bbox_int,
                    confidence=float(conf),
                    behavior=behavior,
                    camera_id=str(settings.CAMERA_INDEX),
                    timestamp=current_time
                )
                
                # Publish to Kafka (fire-and-forget inside its method)
                kafka_producer.produce_detection(det_result.dict())
                
                # Prepare label for drawing
                labels.append(f"#{tracker_id} {behavior}")
            
            # Draw annotations
            annotated_frame = box_annotator.annotate(scene=frame.copy(), detections=tracked_detections)
            annotated_frame = label_annotator.annotate(scene=annotated_frame, detections=tracked_detections, labels=labels)
            
            # Draw zone polygon if exists
            if len(behavior_service.zone_polygon) > 0:
                cv2.polylines(annotated_frame, [behavior_service.zone_polygon], True, (0, 0, 255), 2)
                
            # Update app state
            app.state.active_tracks_count = len(active_ids)
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            app.state.latest_annotated_frame_bytes = buffer.tobytes()
            
            behavior_service.cleanup_tracks(active_ids)
            
            frame_count += 1
            if frame_count % 100 == 0:
                logger.info(f"Processed {frame_count} frames. Currently tracking {len(active_ids)} objects.")
                
        except Exception as e:
            logger.error(f"Error in detection loop: {e}")
            
        elapsed = time.time() - start_time
        sleep_time = max(0, FRAME_SLEEP - elapsed)
        time.sleep(sleep_time)

    cap.release()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Detection Service...")
    app.state.is_running = True
    app.state.camera_connected = False
    app.state.model_loaded = True  # Model is singleton, loaded on import
    app.state.active_tracks_count = 0
    app.state.latest_annotated_frame_bytes = None
    
    # Run cv loop in background thread
    loop = asyncio.get_running_loop()
    loop.run_in_executor(None, process_frame_sync, app)
    
    yield
    # Shutdown
    logger.info("Shutting down Detection Service...")
    app.state.is_running = False

app = FastAPI(title="Detection Service", lifespan=lifespan)

app.include_router(router)
