from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    CAMERA_INDEX: int = 0
    YOLO_MODEL: str = "yolov8n.pt"
    CONFIDENCE_THRESHOLD: float = 0.45
    KAFKA_BROKERS: str = "localhost:9092"
    KAFKA_TOPIC_DETECTIONS: str = "raw.detections"
    ZONE_COORDINATES: str = "[]"  # JSON string of polygon points
    LOITERING_THRESHOLD_SECONDS: int = 30

    class Config:
        env_file = ".env"
        # To avoid warning about Pydantic 2 behavior, extra="ignore" or allow depending on use case
        extra = "allow"

settings = Settings()
