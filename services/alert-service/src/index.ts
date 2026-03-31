import Fastify from 'fastify';
import cors from '@fastify/cors';
import socketio from '@fastify/socket.io';
import { connectDB } from '../../shared/config/db';
import { logger } from '../../shared/utils/logger';
import { startKafkaConsumer } from './kafka/consumer';
import { alertRoutes } from './api/routes';
import { initSocketServer } from './websocket/server';
import { validateEnv } from './config/env';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = validateEnv();
const app = Fastify({ logger: false });

async function bootstrap() {
  await app.register(cors, { origin: env.CORS_ORIGINS.split(',') });
  await app.register(socketio, {
    cors: { origin: env.CORS_ORIGINS.split(','), methods: ['GET', 'POST'] },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  await app.register(alertRoutes, { prefix: '/' });
  await connectDB(env.MONGODB_URI);
  initSocketServer(app.io);
  await startKafkaConsumer(app.io);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info({ port: env.PORT }, '✅ Alert Service started');
}

process.on('SIGTERM', async () => { await app.close(); process.exit(0); });
process.on('SIGINT', async () => { await app.close(); process.exit(0); });

bootstrap().catch((err) => { logger.fatal({ err }, 'Alert service failed'); process.exit(1); });
