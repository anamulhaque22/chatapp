import { createEnv, z } from "@chatapp/common";
import "dotenv/config";

const envSchema = z.object({
  NOVE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ATUH_SERVICE_PORT: z.coerce.number().int().min(0).max(65_535).default(4003),
  AUTH_DB_URL: z.url(),
});

type EnvType = z.infer<typeof envSchema>;

export const env: EnvType = createEnv(envSchema, {
  serviceName: "auth-service",
});

export type Env = typeof env;
