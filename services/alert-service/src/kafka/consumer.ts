// Kafka removed — HTTP mode for Render deployment
// Event-service now calls POST /internal/event directly
import { Server } from 'socket.io';
import { logger } from '../../../shared/utils/logger';

export async function startKafkaConsumer(io: Server): Promise<void> {
  // Store Socket.IO instance globally so the /internal/event HTTP route
  // can access it to broadcast alerts to connected WebSocket clients
  (global as any).alertIO = io;
  logger.info('HTTP mode active — Kafka consumer disabled');
  logger.info('Event service will POST to /internal/event');
}
