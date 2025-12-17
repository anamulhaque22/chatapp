import { ZodObject, ZodRawShape } from "zod";

interface EnvOptions {
  source?: NodeJS.ProcessEnv;
  serverName?: string;
}

type SchemaOutput<TSchema extends ZodRawShape> = ZodObject<TSchema>["_output"];

export const createEnv = <TSchema extends ZodRawShape>(
  schema: ZodObject<TSchema>,
  options: EnvOptions = {}
): SchemaOutput<TSchema> => {
  const { source = process.env, serverName = "Server" } = options;
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    const formattedErrors = parsed.error.format();

    throw new Error(
      `${serverName} environment variables validation failed: ${JSON.stringify(formattedErrors)}`
    );
  }

  return parsed.data;
};

export type EnvSchema<TSchema extends ZodRawShape> = SchemaOutput<TSchema>;
