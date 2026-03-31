import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { logger } from '../config/env';

/**
 * Request logging middleware
 */
export const registerLoggerMiddleware = async (fastify: FastifyInstance) => {
  // Pre-handler for logging start of request
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    logger.info({
      msg: 'Incoming request',
      method: request.method,
      url: request.url,
      requestId: request.id,
      ip: request.ip,
    });
  });

  // Post-handler for logging completion
  fastify.addHook('onResponse', async (request: FastifyRequest, reply: FastifyReply) => {
    logger.info({
      msg: 'Request completed',
      method: request.method,
      url: request.url,
      requestId: request.id,
      statusCode: reply.statusCode,
      duration: reply.getResponseTime(),
    });
  });
};
