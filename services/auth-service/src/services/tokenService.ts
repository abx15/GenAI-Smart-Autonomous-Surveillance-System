import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';

export interface TokenPayload {
  userId: string;
  role: string;
  type?: string;
}

export class TokenService {
  /**
   * Generates a 15-minute access token.
   */
  static generateAccessToken(userId: string, role: string): string {
    return jwt.sign(
      { userId, role, type: 'access' },
      env.JWT_SECRET,
      { expiresIn: env.ACCESS_TOKEN_EXPIRES as any }
    );
  }

  /**
   * Generates a 7-day refresh token.
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES as any }
    );
  }

  /**
   * Verifies an access token.
   */
  static async verifyAccessToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      if (decoded.type !== 'access') return null;
      return decoded;
    } catch (err) {
      return null;
    }
  }

  /**
   * Verifies a refresh token.
   */
  static async verifyRefreshToken(token: string): Promise<TokenPayload | null> {
    try {
      const decoded = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
      if (decoded.type !== 'refresh') return null;
      return decoded;
    } catch (err) {
      return null;
    }
  }

  /**
   * Revokes a refresh token from the User document.
   */
  static async revokeRefreshToken(userId: string, token: string): Promise<void> {
    await User.updateOne({ userId }, { $pull: { refreshTokens: token } });
  }
}
