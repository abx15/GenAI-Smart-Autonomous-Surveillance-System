import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { connectDB } from '../../shared/config/db';
import { logger } from '../../shared/utils/logger';
import { aiRoutes } from './api/routes';
import { validateEnv } from './config/env';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = validateEnv();
const app = Fastify({ logger: false });

async function bootstrap() {
  await app.register(cors, { origin: env.CORS_ORIGINS.split(',') });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(aiRoutes, { prefix: '/' });
  await connectDB(env.MONGODB_URI);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info({ port: env.PORT }, '✅ GenAI Service started');
}

process.on('SIGTERM', async () => { await app.close(); process.exit(0); });
process.on('SIGINT', async () => { await app.close(); process.exit(0); });

bootstrap().catch((err) => { logger.fatal({ err }, 'GenAI service failed'); process.exit(1); });
