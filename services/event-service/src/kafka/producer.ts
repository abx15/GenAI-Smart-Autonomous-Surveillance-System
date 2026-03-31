import { Kafka, Producer } from 'kafkajs';
import { logger } from '../../../../shared/utils/logger';
import { validateEnv } from '../config/env';

const env = validateEnv();

const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID + '-producer',
  brokers: env.KAFKA_BROKERS.split(','),
});

let producer: Producer;

export async function initKafkaProducer(): Promise<void> {
  producer = kafka.producer({
    allowAutoTopicCreation: true,
    retry: { retries: 5 },
  });
  await producer.connect();
  logger.info('Kafka producer connected');
}

export async function publishEvent(event: any): Promise<void> {
  try {
    await producer.send({
      topic: env.KAFKA_TOPIC_EVENTS,
      messages: [{ key: event.cameraId, value: JSON.stringify(event) }],
    });

    // Also publish alert for high/critical
    if (event.severity === 'high' || event.severity === 'critical') {
      await producer.send({
        topic: env.KAFKA_TOPIC_ALERTS,
        messages: [{
          key: event.cameraId,
          value: JSON.stringify({
            eventId: event.eventId,
            message: buildAlertMessage(event),
            severity: event.severity,
            type: event.type,
            cameraId: event.cameraId,
            timestamp: new Date().toISOString(),
            trackId: event.personTrackId,
          }),
        }],
      });
    }
  } catch (err) {
    logger.error({ err, eventId: event.eventId }, 'Failed to publish event to Kafka');
  }
}

function buildAlertMessage(event: any): string {
  const messages: Record<string, string> = {
    intrusion: `🚨 Intrusion detected! Person (ID: ${event.personTrackId}) entered restricted zone ${event.zoneName || event.zoneId} on ${event.cameraId}`,
    loitering: `⚠️ Loitering detected! Person (ID: ${event.personTrackId}) has been stationary for extended time on ${event.cameraId}`,
    zone_entry: `📍 Zone entry: Person (ID: ${event.personTrackId}) entered ${event.zoneName || 'zone'} on ${event.cameraId}`,
    zone_exit: `📍 Zone exit: Person (ID: ${event.personTrackId}) exited ${event.zoneName || 'zone'} on ${event.cameraId}`,
    unattended_object: `📦 Unattended object detected on ${event.cameraId}`,
  };
  return messages[event.type] || `Surveillance event: ${event.type} on ${event.cameraId}`;
}
