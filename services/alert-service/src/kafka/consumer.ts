import { Kafka } from 'kafkajs';
import { Server } from 'socket.io';
import { Alert } from '../models/Alert';
import { shouldSend } from '../services/rateLimiter';
import { broadcastAlert } from '../websocket/broadcaster';
import { logger } from '../../../shared/utils/logger';
import { validateEnv } from '../config/env';

const env = validateEnv();

export async function startKafkaConsumer(io: Server): Promise<void> {
  const kafka = new Kafka({
    clientId: 'alert-service',
    brokers: env.KAFKA_BROKERS.split(','),
  });

  const consumer = kafka.consumer({ groupId: 'alert-service-group' });
  await consumer.connect();
  await consumer.subscribe({ topics: [env.KAFKA_TOPIC_EVENTS, env.KAFKA_TOPIC_ALERTS], fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {
      try {
        if (!message.value) return;
        const payload = JSON.parse(message.value.toString());

        // Only send if rate limit allows
        if (!shouldSend(payload.trackId || payload.personTrackId || 0, payload.type)) return;

        // Build alert object
        const alert = {
          alertId: crypto.randomUUID(),
          eventId: payload.eventId,
          message: payload.message || buildMessage(payload),
          severity: payload.severity,
          type: payload.type,
          cameraId: payload.cameraId,
          trackId: payload.trackId || payload.personTrackId,
          timestamp: new Date().toISOString(),
        };

        // Save to MongoDB
        await Alert.create(alert);

        // Broadcast via Socket.IO
        broadcastAlert(io, alert);

      } catch (err) {
        logger.error({ err }, 'Alert consumer processing error');
      }
    },
  });

  logger.info('Alert Kafka consumer running');
}

function buildMessage(event: any): string {
  const msgs: Record<string, string> = {
    intrusion: `🚨 Intrusion on ${event.cameraId} — Person ID: ${event.personTrackId}`,
    loitering: `⚠️ Loitering on ${event.cameraId} — Person ID: ${event.personTrackId}`,
    zone_entry: `📍 Zone entry on ${event.cameraId}`,
  };
  return msgs[event.type] || `Surveillance alert on ${event.cameraId}`;
}
