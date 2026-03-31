import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { env, logger } from '../config/env';

/**
 * Auth Middleware setup
 */
export const registerAuthMiddleware = async (fastify: FastifyInstance) => {
  // 1. Register JWT plugin
  fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  // 2. Custom Authentication Hook
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    // Skip auth for public routes
    const publicRoutes = [
      '/health',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/refresh',
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
    ];

    if (publicRoutes.some(route => request.url.startsWith(route))) {
      return;
    }

    try {
      // Verify JWT
      await request.jwtVerify();
      
      // The payload will be available as request.user
      const user = request.user as { userId: string; role: string };

      if (!user.userId || !user.role) {
        throw new Error('Malformed token payload');
      }

    } catch (err: any) {
      logger.warn(`Auth failed for ${request.method} ${request.url}: ${err.message}`);
      return reply.status(401).send({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Invalid or missing authentication token',
      });
    }
  });
};

// Type definition for request user
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: string };
    user: { userId: string; role: string };
  }
}
