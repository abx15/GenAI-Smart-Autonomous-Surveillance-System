import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import fastifyProxy from '@fastify/http-proxy';
import { env, logger } from '../config/env';

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  
  // Custom headers to pass down to services
  const preHandler = async (request: FastifyRequest) => {
    // If authenticated, pass user identity to downstream services
    const user = request.user as { userId: string, role: string } | undefined;
    if (user) {
      request.headers['x-user-id'] = user.userId;
      request.headers['x-user-role'] = user.role;
    }
  };

  /**
   * AUTH SERVICE PROXY
   */
  fastify.register(fastifyProxy, {
    upstream: env.AUTH_SERVICE_URL,
    prefix: '/api/auth',
    rewritePrefix: '/auth',
    preHandler,
  });

  /**
   * EVENT SERVICE PROXY
   */
  fastify.register(fastifyProxy, {
    upstream: env.EVENT_SERVICE_URL,
    prefix: '/api/events',
    rewritePrefix: '/events',
    preHandler,
  });

  /**
   * ALERT SERVICE PROXY
   */
  fastify.register(fastifyProxy, {
    upstream: env.ALERT_SERVICE_URL,
    prefix: '/api/alerts',
    rewritePrefix: '/alerts',
    preHandler,
  });

  /**
   * GENAI SERVICE PROXY (Strict Rate Limit)
   */
  fastify.register(fastifyProxy, {
    upstream: env.GENAI_SERVICE_URL,
    prefix: '/api/ai',
    rewritePrefix: '', // genai-service routes start with /query, /summarize, etc.
    preHandler,
    config: {
      rateLimit: {
        max: 20,
        timeWindow: '1 minute'
      }
    }
  });

  /**
   * DETECTION SERVICE PROXY
   */
  fastify.register(fastifyProxy, {
    upstream: env.DETECTION_SERVICE_URL,
    prefix: '/api/detection',
    rewritePrefix: '',
    preHandler,
  });

  /**
   * STREAM PROXY (MJPEG Passthrough)
   */
  fastify.register(fastifyProxy, {
    upstream: env.DETECTION_SERVICE_URL,
    prefix: '/stream',
    rewritePrefix: '/stream',
    preHandler,
  });
}
