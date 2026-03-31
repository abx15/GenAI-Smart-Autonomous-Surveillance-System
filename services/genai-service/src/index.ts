import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { env, logger } from './config/env';
import routes from './api/routes';

const fastify = Fastify({
  logger: false // we use our custom pino logger manually
});

// Auth Middleware decoration
fastify.register(fastifyJwt, {
  secret: env.JWT_SECRET,
});

fastify.decorate("authenticate", async function (request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.send(err);
  }
});

// Extends FastifyInstance to include authenticate
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: any;
  }
}

// Plugins
fastify.register(cors, {
  origin: env.CORS_ORIGIN,
});

// Register Routes
fastify.register(routes);

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  logger.error(error);
  if (error.statusCode) {
    reply.status(error.statusCode).send({ error: error.name, message: error.message });
  } else {
    reply.status(500).send({ error: 'Internal Server Error', message: 'Something went wrong' });
  }
});

// App Lifecycle
const startServer = async () => {
  try {
    // 1. MongoDB
    await mongoose.connect(env.MONGO_URI);
    logger.info('✅ Connected to MongoDB');

    // 2. Start Server
    const port = parseInt(env.PORT, 10);
    await fastify.listen({ port, host: '0.0.0.0' });
    logger.info(`🚀 GenAI Service running on http://0.0.0.0:${port}`);
    
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

// Shutdown
const gracefulShutdown = async () => {
  logger.info('Shutting down...');
  await fastify.close();
  await mongoose.disconnect();
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

startServer();
