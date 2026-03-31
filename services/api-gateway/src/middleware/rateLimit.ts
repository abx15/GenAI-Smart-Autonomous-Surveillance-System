import { FastifyInstance, FastifyRequest } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import { logger } from '../config/env';

export const registerRateLimitMiddleware = async (fastify: FastifyInstance) => {
  fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    
    // Custom key generator: Use userId for authenticated, IP for others
    keyGenerator: (request: FastifyRequest) => {
      const user = request.user as { userId: string } | undefined;
      return user?.userId || request.ip;
    },

    errorResponseBuilder: (request, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${context.after}.`,
        requestId: request.id,
      };
    },

    // Endpoint-specific overrides
    allowList: (request) => {
      // Exempt stream routes
      return request.url.startsWith('/stream');
    },
  });

  // Special rate limit for AI queries
  // Since Fastify plugins are hierarchical, this is easier to handle with 
  // route-level configuration, but for global rule, we could check URL inside hook.
  // Actually, @fastify/rate-limit supports route-level config.
  // We will apply the stricter limit in the proxy routes definition.
};
