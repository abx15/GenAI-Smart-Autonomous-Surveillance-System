/**
 * SASS API GATEWAY
 * 
 * This service acts as the single entry point for all microservices in the SASS ecosystem.
 * It handles:
 * - Request routing and proxying to downstream services
 * - Centralized JWT authentication & user context injection
 * - CORS management
 * - Global rate limiting (implemented per-route in proxy.ts)
 * - DNS resolution fixes for MongoDB Atlas/Kafka in specific environments
 */
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { logger } from '../../../shared/utils/logger';
import { validateEnv } from './config/env';
import { proxyRoutes } from './routes';
import dns from 'dns';

// Fix for high-latency DNS resolution issues in some Docker/VPC environments
dns.setServers(['8.8.8.8', '8.8.4.4']);

const env = validateEnv();
const app = Fastify({ logger: false });

/**
 * Bootstrap the API Gateway
 */
async function bootstrap() {
  // 1. Register CORS with origins from environment
  await app.register(cors, { origin: env.CORS_ORIGINS.split(',') });

  // 2. Register Global JWT authentication
  // Middleware in routes/index.ts handles individual route protection
  await app.register(jwt, { secret: env.JWT_SECRET });

  // 3. Register Proxy Routes
  // All traffic starting with /api is routed to specialized services
  await app.register(proxyRoutes, { prefix: '/' });

  // 4. Start Server
  await app.listen({ port: env.PORT, host: '0.0.0.0' });
  logger.info({ port: env.PORT }, '✅ API Gateway started');
}

// Graceful Shutdown
process.on('SIGTERM', async () => { await app.close(); process.exit(0); });
process.on('SIGINT', async () => { await app.close(); process.exit(0); });

bootstrap().catch((err) => {
  logger.fatal({ err }, 'API Gateway failed to start');
  process.exit(1);
});
