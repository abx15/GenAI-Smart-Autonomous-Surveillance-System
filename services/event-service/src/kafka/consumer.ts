// Kafka removed — HTTP mode for Render deployment
// Detection service now calls POST /internal/detection directly
import { logger } from '../../../shared/utils/logger';

export async function startKafkaConsumer(): Promise<void> {
  logger.info('HTTP mode active — Kafka consumer disabled');
  logger.info('Detection service will POST to /internal/detection');
}
