import json
from pydantic import BaseModel
from typing import List, Optional

class DetectionResult(BaseModel):
    track_id: int
    bbox: List[int]  # [x1, y1, x2, y2]
    confidence: float
    behavior: str
    camera_id: str
    timestamp: float
    zone_id: Optional[str] = None
