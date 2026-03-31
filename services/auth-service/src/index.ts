import Fastify from 'fastify';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { env, logger } from './config/env';
import routes from './api/routes';

const fastify = Fastify({
  logger: false, // Custom logger handled manually
  requestIdHeader: 'x-request-id',
});

// Plugins registration
fastify.register(cors, {
  origin: '*', // Adjust for production
});

// Routes registration
fastify.register(routes, { prefix: '/auth' });

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error({
    msg: error.message,
    stack: error.stack,
    requestId: request.id,
  });

  if (error.validation) {
    return reply.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: error.message,
      requestId: request.id,
    });
  }

  const statusCode = error.statusCode || 500;
  return reply.status(statusCode).send({
    statusCode,
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong',
    requestId: request.id,
  });
});

/**
 * Start Server
 */
const start = async () => {
  try {
    // 1. Connect MongoDB
    await mongoose.connect(env.MONGODB_URI);
    logger.info('✅ Successfully connected to MongoDB');

    // 2. Listen
    const port = parseInt(env.PORT, 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`🚀 Auth Service is listening on http://0.0.0.0:${port}`);
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Graceful Shutdown
const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  await fastify.close();
  await mongoose.disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
