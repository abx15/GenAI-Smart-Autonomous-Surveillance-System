import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export const tokenService = {
  generateAccessToken(userId: string, role: string): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '15m' });
  },
  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
  },
  verifyAccessToken(token: string): any {
    try { return jwt.verify(token, JWT_SECRET); } catch { return null; }
  },
  verifyRefreshToken(token: string): any {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any;
      return payload.type === 'refresh' ? payload : null;
    } catch { return null; }
  },
};
