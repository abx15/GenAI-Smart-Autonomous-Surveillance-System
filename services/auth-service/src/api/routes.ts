import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from '../services/authService';
import { TokenService } from '../services/tokenService';
import { logger } from '../config/env';
import { User } from '../models/User';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { userId: string, role: string };
  }
}

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  
  // Middleware to ensure user is authenticated (using headers from Gateway)
  const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.headers['x-user-id'] as string;
    const role = request.headers['x-user-role'] as string;

    if (!userId || !role) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Missing auth headers' });
    }

    request.user = { userId, role };
  };

  // Health check
  fastify.get('/health', async () => {
    return { status: 'ok', service: 'auth-service' };
  });

  // Register
  fastify.post('/auth/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const result = await AuthService.register(request.body);
      return reply.status(201).send(result);
    } catch (err: any) {
      logger.error('Registration error:', err.message);
      return reply.status(400).send({ error: 'Registration failed', message: err.message });
    }
  });

  // Login
  fastify.post('/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { email, password } = request.body as any;
      const result = await AuthService.login(email, password);
      return reply.status(200).send(result);
    } catch (err: any) {
      logger.error('Login error:', err.message);
      return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid credentials' });
    }
  });

  // Refresh
  fastify.post('/auth/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const { refreshToken } = request.body as any;
      const result = await AuthService.refresh(refreshToken);
      return reply.status(200).send(result);
    } catch (err: any) {
      logger.error('Refresh error:', err.message);
      return reply.status(401).send({ error: 'Unauthorized', message: err.message });
    }
  });

  // Logout (auth required)
  fastify.post('/auth/logout', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { refreshToken } = request.body as any;
      const { userId } = request.user!;
      await AuthService.logout(userId, refreshToken);
      return reply.status(200).send({ message: 'Logged out successfully' });
    } catch (err: any) {
      logger.error('Logout error:', err.message);
      return reply.status(400).send({ error: 'Logout failed', message: err.message });
    }
  });

  // Profile (auth required)
  fastify.get('/auth/me', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { userId } = request.user!;
      const user = await User.findOne({ userId });
      if (!user) {
        return reply.status(401).send({ error: 'Unauthorized', message: 'User not found' });
      }
      return { user: user.toObject() };
    } catch (err: any) {
      return reply.status(500).send({ error: 'Internal Server Error', message: err.message });
    }
  });

  // Change Password (auth required)
  fastify.put('/auth/change-password', { preHandler: authenticate }, async (request, reply) => {
    try {
      const { userId } = request.user!;
      const { oldPassword, newPassword } = request.body as any;
      await AuthService.changePassword(userId, oldPassword, newPassword);
      return { message: 'Password changed successfully' };
    } catch (err: any) {
      logger.error('Change password error:', err.message);
      return reply.status(400).send({ error: 'Action failed', message: err.message });
    }
  });
}
