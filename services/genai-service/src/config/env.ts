import { z } from 'zod';
import dotenv from 'dotenv';
import pino from 'pino';

// Default to development if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  } : undefined
});

const envSchema = z.object({
  PORT: z.string().default('4004'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGO_URI: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(10),
  CORS_ORIGIN: z.string().default('*')
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('❌ Invalid environment variables');
  logger.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
