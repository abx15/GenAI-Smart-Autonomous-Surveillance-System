import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { logger } from '../../../shared/utils/logger';
import { validateEnv } from './config/env';
import { proxyRoutes } from './routes';
import dns from 'dns';

dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = validateEnv();
const app = Fastify({ logger: false });

async function bootstrap() {
  await app.register(cors, { origin: env.CORS_ORIGINS.split(',') });
  await app.register(jwt, { secret: env.JWT_SECRET });
  await app.register(proxyRoutes, { prefix: '/' });
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info({ port: env.PORT }, '✅ API Gateway started');
}

process.on('SIGTERM', async () => { await app.close(); process.exit(0); });
process.on('SIGINT', async () => { await app.close(); process.exit(0); });

bootstrap().catch((err) => { logger.fatal({ err }, 'API Gateway failed'); process.exit(1); });
