import numpy as np
import torch
from ultralytics import YOLO
from typing import List, Dict, Any
from app.core.config import settings
from app.core.logger import logger
import ultralytics.nn.tasks
import torch.nn.modules.container

class YOLOModel:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(YOLOModel, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance

    def _initialize(self):
        logger.info(f"Loading YOLO model: {settings.YOLO_MODEL}")
        # Monkey patch torch.load to use weights_only=False for ultralytics
        original_torch_load = torch.load
        def patched_torch_load(*args, **kwargs):
            kwargs['weights_only'] = False
            return original_torch_load(*args, **kwargs)
        
        torch.load = patched_torch_load
        try:
            self.model = YOLO(settings.YOLO_MODEL)
        except Exception as e:
            logger.warning(f"Default loading failed: {e}")
            # Force download the model if it doesn't exist
            self.model = YOLO('yolov8n.pt')
        finally:
            # Restore original torch.load
            torch.load = original_torch_load
            
        self.filter_classes = [0]  # person only
        logger.info("YOLO model loaded successfully")

    def detect(self, frame: np.ndarray) -> List[Dict[str, Any]]:
        # Run inference
        results = self.model(frame, classes=self.filter_classes, verbose=False, conf=settings.CONFIDENCE_THRESHOLD)
        
        detections = []
        if results and len(results) > 0:
            result = results[0]
            boxes = result.boxes
            
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                conf = box.conf[0].item()
                cls = int(box.cls[0].item())
                
                detections.append({
                    "bbox": [int(x1), int(y1), int(x2), int(y2)],
                    "confidence": conf,
                    "class_name": self.model.names[cls] if cls in self.model.names else str(cls)
                })
        
        return detections

# Instantiate singleton
yolo_model = YOLOModel()
