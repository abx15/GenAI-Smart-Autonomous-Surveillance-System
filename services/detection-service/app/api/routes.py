from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any

from app.core.config import settings
from app.core.logger import logger
from app.services.behavior import behavior_service

router = APIRouter()

class ZoneConfigRequest(BaseModel):
    zone_coordinates: str  # JSON string

@router.get("/health")
def health_check(request: Request) -> Dict[str, Any]:
    """
    Health check endpoint for the detection service.
    
    Returns:
        dict: Service status including model load state and camera connection status.
        
    Response example:
        {
            "status": "ok",
            "model_loaded": True,
            "camera_connected": True,
            "timestamp": "2024-01-15T10:30:00Z"
        }
    """
    # app state
    camera_connected = request.app.state.camera_connected
    model_loaded = request.app.state.model_loaded
    return {
        "status": "ok" if camera_connected and model_loaded else "degraded",
        "model_loaded": model_loaded,
        "camera_connected": camera_connected
    }

@router.post("/config")
def update_config(config: ZoneConfigRequest):
    """
    Update detection configuration at runtime (no restart needed).
    
    Args:
        config (ZoneConfigRequest): {
            "zone_coordinates": list[list[int]] - Polygon points [[x,y], ...] for restricted zones
        }
        
    Returns:
        dict: { "status": "success", "message": "Config updated" }
    """
    try:
        behavior_service.update_zones(config.zone_coordinates)
        return {"status": "success", "message": "Zone coordinates updated"}
    except Exception as e:
        logger.error(f"Failed to update config: {e}")
        raise HTTPException(status_code=400, detail="Invalid configurations")

@router.get("/stats")
def get_stats(request: Request) -> Dict[str, Any]:
    """
    Get current detection statistics.
    
    Returns real-time information about active tracking and detection state.
    
    Returns:
        dict: {
            "tracked_persons": int,      - Number of persons currently tracked
            "active_zones": bool,       - Whether monitoring zones are defined
        }
    """
    active_tracks = request.app.state.active_tracks_count
    return {
        "tracked_persons": active_tracks,
        "active_zones": len(behavior_service.zone_polygon) > 0
    }

def generate_frames(request: Request):
    """Generator for MJPEG stream from the app's drawn frames"""
    while True:
        # Avoid breaking if shutdown
        if not getattr(request.app.state, "is_running", False):
            break
            
        frame_bytes = getattr(request.app.state, "latest_annotated_frame_bytes", None)
        if frame_bytes is None:
            continue

        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@router.get("/stream")
def stream_video(request: Request):
    """
    MJPEG video stream endpoint.
    
    Streams live webcam feed with YOLOv8 bounding boxes and tracking overlays.
    Uses multipart/x-mixed-replace content type for real-time streaming.
    
    Note:
        - Stream runs at ~15 FPS to balance performance and bandwidth
        - Each frame has bounding boxes drawn for detected persons
        - Track IDs are shown above each bounding box
        - Zone overlay is drawn if zones are configured
        
    Returns:
        StreamingResponse: MJPEG stream (multipart/x-mixed-replace; boundary=frame)
    """
    return StreamingResponse(generate_frames(request), media_type="multipart/x-mixed-replace; boundary=frame")
