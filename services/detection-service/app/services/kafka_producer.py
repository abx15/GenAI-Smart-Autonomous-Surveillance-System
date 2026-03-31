import json
from confluent_kafka import Producer
from app.core.config import settings
from app.core.logger import logger

class KafkaProducerService:
    def __init__(self):
        conf = {
            'bootstrap.servers': settings.KAFKA_BROKERS,
            'client.id': 'detection-service'
        }
        try:
            self.producer = Producer(conf)
            logger.info("Kafka Producer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Kafka Producer: {e}")
            self.producer = None

    def delivery_report(self, err, msg):
        if err is not None:
            logger.error(f"Message delivery failed: {err}")
        # else fire-and-forget success

    def produce_detection(self, detection_result: dict) -> None:
        if self.producer is None:
            return
            
        try:
            # key = camera_id
            key = detection_result.get("camera_id", "0")
            value = json.dumps(detection_result)
            
            self.producer.produce(
                topic=settings.KAFKA_TOPIC_DETECTIONS,
                key=key,
                value=value,
                callback=self.delivery_report
            )
            self.producer.poll(0)  # non-blocking
        except Exception as e:
            logger.error(f"Error producing to Kafka: {e}")

kafka_producer = KafkaProducerService()
