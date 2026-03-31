import { z } from 'zod';
import { User, IUser, UserRole } from '../models/User';
import { TokenService } from './tokenService';
import { logger } from '../config/env';

// Password requirement: min 8 characters, one uppercase, one number
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export class AuthService {
  /**
   * Register a new user.
   */
  static async register(data: any) {
    const { email, password, firstName, lastName, role } = data;

    // Validate password
    passwordSchema.parse(password);

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Create user
    const user = new User({ email, password, firstName, lastName, role });
    await user.save();

    // Generate tokens
    const accessToken = TokenService.generateAccessToken(user.userId, user.role);
    const refreshToken = TokenService.generateRefreshToken(user.userId);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  /**
   * Login a user.
   */
  static async login(email: string, password: string) {
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new Error('Invalid credentials');
    }

    if (!user.active) {
      throw new Error('User is inactive');
    }

    // Update lastLogin
    user.lastLogin = new Date();

    // Generate tokens
    const accessToken = TokenService.generateAccessToken(user.userId, user.role);
    const refreshToken = TokenService.generateRefreshToken(user.userId);

    // Save refresh token
    user.refreshTokens.push(refreshToken);
    await user.save();

    return { accessToken, refreshToken, user: this.sanitizeUser(user) };
  }

  /**
   * Refresh token rotation: every refresh invalidates old token.
   */
  static async refresh(oldRefreshToken: string) {
    const payload = await TokenService.verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findOne({ userId: payload.userId });
    if (!user || !user.refreshTokens.includes(oldRefreshToken)) {
      // If refresh token reuse is detected, we could invalidate all tokens for security
      if (user) {
        user.refreshTokens = [];
        await user.save();
      }
      throw new Error('Invalid refresh token or potential reuse detected');
    }

    // Remove old token (invalidate it)
    user.refreshTokens = user.refreshTokens.filter(t => t !== oldRefreshToken);

    // Generate new token pair
    const accessToken = TokenService.generateAccessToken(user.userId, user.role);
    const newRefreshToken = TokenService.generateRefreshToken(user.userId);

    // Add new refresh token
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout: revoke current refreshToken.
   */
  static async logout(userId: string, refreshToken: string) {
    await TokenService.revokeRefreshToken(userId, refreshToken);
  }

  /**
   * Change password logic.
   */
  static async changePassword(userId: string, oldPass: string, newPass: string) {
    const user = await User.findOne({ userId }).select('+password');
    if (!user || !(await user.comparePassword(oldPass))) {
      throw new Error('Invalid credentials');
    }

    // Validate new password
    passwordSchema.parse(newPass);

    user.password = newPass; // Pre-save hook will hash it
    // Optional: Logout other sessions?
    // user.refreshTokens = [];
    await user.save();
  }

  /**
   * Sanitize user document for response.
   */
  private static sanitizeUser(user: IUser) {
    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.refreshTokens;
    delete userObj.__v;
    delete userObj._id;
    return userObj;
  }
}
