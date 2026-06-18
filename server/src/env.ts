import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string(),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string(),
  GOOGLE_OAUTH_REDIRECT_URI: z.string(),
  CORSAIR_OAUTH_REDIRECT_URI: z
    .string()
    .default("http://localhost:8000/api/integrations/callback"),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  EMAIL_FROM: z.string(),
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string(),
  JWT_EMAIL_VARIFICATION_TOKEN_SECRET: z.string(),
  JWT_EMAIL_VARIFICATION_TOKEN_EXPIRES_IN: z.string(),
  APP_URL: z.string(),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_PASSWORD_RESET_SECRET: z.string(),
  JWT_PASSWORD_RESET_EXPIRES_IN: z.string(),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(8000),
  LOGGER_LEVEL: z.enum(["error", "debug", "info"]).optional(),
  GROQ_API_KEY: z.string(),
  TAVILY_API_KEY: z.string(),
  CORSAIR_DEV_KEY: z.string(),
  CORSAIR_KEK: z.string(),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);
  if (!safeParseResult.success) throw new Error(safeParseResult.error.message);
  return safeParseResult.data;
}

export const env = createEnv(process.env);
