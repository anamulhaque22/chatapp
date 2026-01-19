import { createEnv, z } from '@chatapp/common';
import 'dotenv/config';

const envSchema = z.object({
  NOVE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  USER_SERVICE_PORT: z.coerce.number().int().min(0).max(65_535).default(4001),
  SERVICE_NAME: z.string().default('user-service'),
  USER_DB_URL: z.url(),
  INTERNAL_API_TOKEN: z.string().min(32),
  RABBITMQ_URL: z.string().url(),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
  serviceName: 'user-service',
});

export type Env = typeof env;
