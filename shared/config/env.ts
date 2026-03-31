/**
 * Purpose: Global schema-driven environment variables using Zod for type-safe config.
 */
import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().url(),
  KAFKA_BROKERS: z.string(),
  JWT_SECRET: z.string().min(16),
  OPENAI_API_KEY: z.string(),
  PORT: z.string().regex(/^\d+$/).transform(Number).default('4000'),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export const validateEnv = (envVars: Record<string, string | undefined>): EnvConfig => {
  const parsed = EnvSchema.safeParse(envVars);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
};
