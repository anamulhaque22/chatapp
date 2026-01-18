import { createEnv, z } from '@chatapp/common';
import 'dotenv/config';

const envSchema = z.object({
  NOVE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CHAT_SERVICE_PORT: z.coerce.number().int().min(0).max(65_535).default(4008),
  INTERNAL_API_TOKEN: z.string().min(16),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(32),
  RABBITMQ_URI: z.string().url(),
  REDIS_URL: z.string().url(),
  MONGODB_URI: z.string().url(),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
  serviceName: 'chat-service',
});

export type Env = typeof env;
