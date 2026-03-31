import Fastify from 'fastify';
import cors from '@fastify/cors';
import { connectDB } from '../../shared/config/db';
import { logger } from '../../shared/utils/logger';
import { startKafkaConsumer } from './kafka/consumer';
import { initKafkaProducer } from './kafka/producer';
import { eventRoutes } from './api/routes';
import { startLoiteringCleanup } from './services/loiteringTracker';
import { validateEnv } from './config/env';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = validateEnv();

const app = Fastify({ logger: false });

async function bootstrap() {
  // Register plugins
  await app.register(cors, { origin: env.CORS_ORIGINS.split(',') });

  // Register routes
  await app.register(eventRoutes, { prefix: '/' });

  // Connect DB
  await connectDB(env.MONGODB_URI);

  // Start Kafka
  await initKafkaProducer();
  await startKafkaConsumer();

  // Start loitering cleanup interval
  startLoiteringCleanup();

  // Start server
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info({ port: env.PORT }, '✅ Event Service started');
}

// Graceful shutdown
async function shutdown() {
  logger.info('Shutting down event service...');
  await app.close();
  process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

bootstrap().catch((err) => {
  logger.fatal({ err }, 'Failed to start event service');
  process.exit(1);
});
