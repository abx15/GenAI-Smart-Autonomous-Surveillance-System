import { z } from 'zod';
import dotenv from 'dotenv';
import pino from 'pino';

// Load environment variables
dotenv.config();

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  } : undefined,
});

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(16),
  
  // Service Targets
  AUTH_SERVICE_URL: z.string().url().default('http://auth-service:3001'),
  EVENT_SERVICE_URL: z.string().url().default('http://event-service:3002'),
  ALERT_SERVICE_URL: z.string().url().default('http://alert-service:3003'),
  GENAI_SERVICE_URL: z.string().url().default('http://genai-service:4004'),
  DETECTION_SERVICE_URL: z.string().url().default('http://detection-service:8001'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  logger.error('❌ Invalid environment variables');
  logger.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
