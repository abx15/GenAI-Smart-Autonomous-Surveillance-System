import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  CORS_ORIGINS: z.string().default('http://localhost:3006'),
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  EVENT_SERVICE_URL: z.string().default('http://localhost:3002'),
  ALERT_SERVICE_URL: z.string().default('http://localhost:3003'),
  GENAI_SERVICE_URL: z.string().default('http://localhost:3004'),
});

export type Env = z.infer<typeof schema>;

export function validateEnv(): Env {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }
  return result.data;
}
