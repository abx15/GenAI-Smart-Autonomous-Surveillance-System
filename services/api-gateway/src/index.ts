import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import helmet from '@fastify/helmet';
import cors from '@fastify/cors';
import crypto from 'crypto';
import { env, logger } from './config/env';
import { registerAuthMiddleware } from './middleware/auth';
import { registerRateLimitMiddleware } from './middleware/rateLimit';
import { registerLoggerMiddleware } from './middleware/logger';
import routes from './routes';

const fastify = Fastify({
  logger: false, // Customized manually
  genReqId: (req) => (req.headers['x-request-id'] as string) || crypto.randomUUID(),
});

// Extend FastifyInstance to include authenticate
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Configure Plugins and Middleware
 */
const setupServer = async () => {
  // 1. Security Headers
  await fastify.register(helmet, { contentSecurityPolicy: false });

  // 2. CORS
  await fastify.register(cors, {
    origin: '*', // Adjust for production
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // 3. Auth (JWT)
  await registerAuthMiddleware(fastify);

  // 4. Rate Limiting
  await registerRateLimitMiddleware(fastify);

  // 5. Logging
  await registerLoggerMiddleware(fastify);

  // 6. Request Decoration
  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    // Run authentication hook
    await fastify.authenticate(request, reply);
  });

  // 7. Routes
  await fastify.register(routes);

  // 8. Global Error Handler
  fastify.setErrorHandler((error, request: any, reply) => {
    logger.error({
      msg: error.message,
      stack: error.stack,
      requestId: request.id,
    });

    const statusCode = error.statusCode || 500;
    return reply.status(statusCode).send({
      statusCode,
      error: error.name || 'Internal Server Error',
      message: error.message || 'Something went wrong',
      requestId: request.id,
    });
  });
};

/**
 * Start Server
 */
const start = async () => {
  try {
    await setupServer();
    const port = parseInt(env.PORT, 10);
    // Use any cast to avoid TS version mismatch for listen options
    await fastify.listen({ port, host: '0.0.0.0' } as any);
    logger.info(`🚀 API Gateway is running on http://0.0.0.0:${port}`);
  } catch (err) {
    logger.error('❌ Failed to start API Gateway:', err);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Gateway shutting down gracefully...');
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
