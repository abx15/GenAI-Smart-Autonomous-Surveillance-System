import { FastifyInstance } from 'fastify';
import { User } from '../models/User';
import { tokenService } from '../services/tokenService';
import { z } from 'zod';
import { logger } from '../../../shared/utils/logger';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[0-9]/),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['admin','operator','viewer']).optional().default('viewer'),
});

export async function authRoutes(app: FastifyInstance) {

  /**
   * @route   GET /health
   * @desc    Check auth service health and status
   * @access  Public
   * @returns { success, data: { status, service, timestamp } }
   */
  app.get('/health', async () => ({
    success: true,
    data: { status: 'ok', service: 'auth-service', timestamp: new Date().toISOString() }
  }));

  /**
   * @route   POST /auth/register
   * @desc    Register a new user account
   * @access  Public
   * @body    { email, password (min 8 chars, 1 uppercase, 1 number), firstName, lastName, role }
   * @returns { success, data: { accessToken, refreshToken, user } }
   * @note    Password is hashed with bcrypt (rounds: 12) before storage
   */
  app.post('/auth/register', async (req, reply) => {
    try {
      const body = registerSchema.parse(req.body);
      const existing = await User.findOne({ email: body.email });
      if (existing) return reply.status(409).send({ success: false, error: 'DUPLICATE', message: 'Email already registered' });

      const user = await User.create(body);
      const accessToken = tokenService.generateAccessToken(user.userId, user.role);
      const refreshToken = tokenService.generateRefreshToken(user.userId);
      user.refreshTokens.push(refreshToken);
      await user.save();

      return reply.status(201).send({
        success: true,
        data: { accessToken, refreshToken, user: { userId: user.userId, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } },
      });
    } catch (err: any) {
      if (err.name === 'ZodError') return reply.status(400).send({ success: false, error: 'VALIDATION', message: err.errors });
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Registration failed' });
    }
  });

  /**
   * @route   POST /auth/login
   * @desc    Authenticate user and return JWT tokens
   * @access  Public
   * @body    { email, password }
   * @returns { success, data: { accessToken (15m), refreshToken (7d), user } }
   * @note    Updates user.lastLogin on successful auth
   */
  app.post('/auth/login', async (req, reply) => {
    try {
      const { email, password } = req.body as any;
      const user = await User.findOne({ email, active: true }).select('+password');
      if (!user || !(await user.comparePassword(password))) {
        return reply.status(401).send({ success: false, error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
      }

      const accessToken = tokenService.generateAccessToken(user.userId, user.role);
      const refreshToken = tokenService.generateRefreshToken(user.userId);
      user.refreshTokens = [...user.refreshTokens.slice(-4), refreshToken]; // keep last 5
      user.lastLogin = new Date();
      await user.save();

      logger.info({ userId: user.userId }, 'User logged in');
      return {
        success: true,
        data: { accessToken, refreshToken, user: { userId: user.userId, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName } },
      };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Login failed' });
    }
  });

  /**
   * @route   POST /auth/refresh
   * @desc    Rotate access token using a valid refresh token
   * @access  Public (requires valid refresh token in body)
   * @body    { refreshToken }
   * @returns { success, data: { accessToken, refreshToken } }
   * @note    Old refresh token is revoked on use (rotation strategy)
   */
  app.post('/auth/refresh', async (req, reply) => {
    try {
      const { refreshToken } = req.body as any;
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (!payload) return reply.status(401).send({ success: false, error: 'INVALID_TOKEN', message: 'Invalid refresh token' });

      const user = await User.findOne({ userId: payload.userId, refreshTokens: refreshToken });
      if (!user) return reply.status(401).send({ success: false, error: 'TOKEN_REVOKED', message: 'Token has been revoked' });

      // Rotate tokens
      const newAccess = tokenService.generateAccessToken(user.userId, user.role);
      const newRefresh = tokenService.generateRefreshToken(user.userId);
      user.refreshTokens = user.refreshTokens.filter((t: string) => t !== refreshToken);
      user.refreshTokens.push(newRefresh);
      await user.save();

      return { success: true, data: { accessToken: newAccess, refreshToken: newRefresh } };
    } catch (err) {
      return reply.status(500).send({ success: false, error: 'INTERNAL_ERROR', message: 'Token refresh failed' });
    }
  });

  /**
   * @route   GET /auth/me
   * @desc    Get currently authenticated user's profile
   * @access  Private
   * @returns { success, data: { userId, email, role, firstName, lastName, lastLogin } }
   */
  app.get('/auth/me', {
    preHandler: async (req, reply) => {
      try { await req.jwtVerify(); } catch { reply.status(401).send({ success: false, error: 'UNAUTHORIZED' }); }
    }
  }, async (req, reply) => {
    const { userId } = (req as any).user;
    const user = await User.findOne({ userId }).lean();
    if (!user) return reply.status(404).send({ success: false, error: 'NOT_FOUND' });
    return { success: true, data: { userId: user.userId, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, lastLogin: user.lastLogin } };
  });

  /**
   * @route   POST /auth/logout
   * @desc    Revoke the provided refresh token (logout)
   * @access  Public
   * @body    { refreshToken }
   * @returns { success, message: 'Logged out successfully' }
   */
  app.post('/auth/logout', async (req, reply) => {
    const { refreshToken } = req.body as any;
    if (refreshToken) {
      const payload = tokenService.verifyRefreshToken(refreshToken);
      if (payload) await User.updateOne({ userId: payload.userId }, { $pull: { refreshTokens: refreshToken } });
    }
    return { success: true, message: 'Logged out successfully' };
  });
}
