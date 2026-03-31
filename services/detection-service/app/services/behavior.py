import cv2
import json
import numpy as np
from typing import List, Tuple, Dict
from app.core.config import settings
from app.core.logger import logger

class BehaviorService:
    def __init__(self):
        self.track_entry_times: Dict[int, float] = {}
        try:
            self.zone_polygon = np.array(json.loads(settings.ZONE_COORDINATES), np.int32)
        except Exception as e:
            logger.error(f"Failed to load ZONE_COORDINATES: {e}")
            self.zone_polygon = np.array([], np.int32)
            
    def update_zones(self, zone_coordinates_str: str):
        try:
            self.zone_polygon = np.array(json.loads(zone_coordinates_str), np.int32)
            logger.info("Zone coordinates updated.")
        except Exception as e:
            logger.error(f"Failed to update zones: {e}")

    def is_loitering(self, track_id: int, current_time: float) -> bool:
        if track_id not in self.track_entry_times:
            self.track_entry_times[track_id] = current_time
            return False
            
        time_diff = current_time - self.track_entry_times[track_id]
        return time_diff >= settings.LOITERING_THRESHOLD_SECONDS

    def is_in_zone(self, bbox: List[int]) -> bool:
        if len(self.zone_polygon) == 0:
            return False
            
        x1, y1, x2, y2 = bbox
        # Calculate bottom center point for feet position
        center_x = (x1 + x2) // 2
        bottom_y = y2
        
        point = (center_x, bottom_y)
        # return 1 if inside, 0 if on contour, -1 if outside
        result = cv2.pointPolygonTest(self.zone_polygon, point, False)
        return result >= 0

    def get_behavior_label(self, track_id: int, bbox: List[int], current_time: float) -> str:
        if self.is_in_zone(bbox):
            return "zone_intrusion"
        elif self.is_loitering(track_id, current_time):
            return "loitering"
        return "normal"

    def cleanup_tracks(self, active_track_ids: List[int]):
        # Remove expired tracks
        inactive_ids = [tid for tid in self.track_entry_times if tid not in active_track_ids]
        for tid in inactive_ids:
            del self.track_entry_times[tid]

behavior_service = BehaviorService()
