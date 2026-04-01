# Kafka removed — HTTP mode for Render deployment
# Detection results are sent directly to event-service via HTTP POST
import httpx
import os
from app.core.logger import logger

EVENT_SERVICE_URL = os.getenv("EVENT_SERVICE_URL", "http://localhost:3002")

async def produce_detection(detection_result: dict) -> None:
    """
    Send detection result to event-service via HTTP POST.
    
    This replaces the Kafka raw.detections topic.
    Non-blocking — errors are logged but don't crash the detection loop.
    
    Args:
        detection_result: Dict containing track_id, behavior, camera_id,
                         zone_id, bbox, confidence, timestamp
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(
                f"{EVENT_SERVICE_URL}/internal/detection",
                json=detection_result,
                headers={"Content-Type": "application/json"},
            )
            if response.status_code == 200:
                logger.debug(
                    f"Detection sent to event-service: track_id={detection_result.get('track_id')}"
                )
            else:
                logger.warning(
                    f"Event service returned {response.status_code} for detection"
                )
    except httpx.TimeoutException:
        logger.warning("Event service timeout — detection dropped")
    except httpx.ConnectError:
        logger.warning(f"Cannot connect to event-service at {EVENT_SERVICE_URL}")
    except Exception as e:
        logger.error(f"Unexpected error sending detection: {e}")
