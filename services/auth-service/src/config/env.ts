import { createEnv, z } from '@chatapp/common';
import 'dotenv/config';

const envSchema = z.object({
  NOVE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SERVICE_PORT: z.coerce.number().int().min(0).max(65_535).default(4003),
  AUTH_DB_URL: z.url(),

  JWT_ACCESS_TOKEN_SECRET: z.string().min(32),
  JWT_REFRESH_TOKEN_SECRET: z.string().min(32),
  JWT_ACCESS_TOKEN_EXPIRATION: z.string().default('1d'),
  JWT_REFRESH_TOKEN_EXPIRATION: z.string().default('7d'),

  INTERNAL_API_TOKEN: z.string().min(32),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
  serviceName: 'auth-service',
});

export type Env = typeof env;
