// Kafka removed — HTTP mode for Render deployment
// Events are sent directly to alert-service via HTTP POST
import axios from 'axios';
import { logger } from '../../../shared/utils/logger';

const ALERT_SERVICE_URL = process.env.ALERT_SERVICE_URL || 'http://localhost:3003';

export async function initKafkaProducer(): Promise<void> {
  logger.info({ alertServiceUrl: ALERT_SERVICE_URL }, 'HTTP producer initialized');
}

export async function publishEvent(event: any): Promise<void> {
  try {
    await axios.post(
      `${ALERT_SERVICE_URL}/internal/event`,
      event,
      {
        timeout: 5000,
        headers: { 'Content-Type': 'application/json' },
      }
    );
    logger.info({ eventId: event.eventId, type: event.type }, 'Event sent to alert-service via HTTP');
  } catch (err: any) {
    // Non-blocking — log error but don't crash event service
    logger.error(
      { err: err.message, eventId: event.eventId },
      'Failed to send event to alert-service'
    );
  }
}
