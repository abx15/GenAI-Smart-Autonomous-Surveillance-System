import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(3002),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string().default('event-service'),
  KAFKA_GROUP_ID: z.string().default('event-service-group'),
  KAFKA_TOPIC_DETECTIONS: z.string().default('raw.detections'),
  KAFKA_TOPIC_EVENTS: z.string().default('processed.events'),
  KAFKA_TOPIC_ALERTS: z.string().default('alerts.triggered'),
  CORS_ORIGINS: z.string().default('http://localhost:3006'),
  LOITERING_THRESHOLD_SECONDS: z.coerce.number().default(30),
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
