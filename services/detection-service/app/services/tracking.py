import supervision as sv
from app.core.logger import logger

class TrackingService:
    def __init__(self):
        self.tracker = sv.ByteTrack()
        logger.info("Initialized ByteTracker")

    def track(self, detections: sv.Detections) -> sv.Detections:
        return self.tracker.update_with_detections(detections)

tracking_service = TrackingService()
