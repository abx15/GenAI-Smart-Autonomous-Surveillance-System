/**
 * Purpose: Standard definitions for Kafka messaging structure and topics.
 */

export const KAFKA_TOPICS = {
  DETECTIONS: 'raw.detections',
  EVENTS: 'processed.events',
  ALERTS: 'alerts.triggered',
} as const;

export interface KafkaMessage<T> {
  topic: string; // From KAFKA_TOPICS
  partition: number;
  offset: string;
  key: string; // typically cameraId or eventId
  value: T; // The payload (e.g. DetectionEvent)
  timestamp: string; // Unix timestamp
}
