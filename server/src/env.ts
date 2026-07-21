import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
  GOOGLE_OAUTH_REDIRECT_URI: z.string().min(1),
  CORSAIR_OAUTH_REDIRECT_URI: z
    .string()
    .min(1)
    .default("http://localhost:8000/api/integrations/callback"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  JWT_ACCESS_TOKEN_SECRET: z.string().min(1),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().min(1),
  JWT_EMAIL_VARIFICATION_TOKEN_SECRET: z.string().min(1),
  JWT_EMAIL_VARIFICATION_TOKEN_EXPIRES_IN: z.string().min(1),
  APP_URL: z.string().min(1),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  JWT_PASSWORD_RESET_SECRET: z.string().min(1),
  JWT_PASSWORD_RESET_EXPIRES_IN: z.string().min(1),
  NODE_ENV: z.enum(["development", "production"]).default("development"),
  PORT: z.coerce.number().default(8000),
  LOGGER_LEVEL: z.enum(["error", "debug", "info"]).optional(),
  GROQ_API_KEY: z.string().min(1),
  TAVILY_API_KEY: z.string().min(1),
  CORSAIR_DEV_KEY: z.string().min(1),
  CORSAIR_KEK: z.string().min(1),

  // Database — previously read via process.env.DATABASE_URL! without
  // validation, which allowed the server to start and then fail on the first
  // query. Validated here so startup fails fast with a clear message.
  DATABASE_URL: z.string().min(1),

  // Cookie configuration — environment-driven so the same code works on
  // localhost, custom production domains, Render, and preview deployments
  // without hardcoding. See getCookieOptions in auth.service.ts.
  //   COOKIE_DOMAIN: leave unset for localhost/preview (host-only cookie);
  //     set to e.g. ".stelix.akhtarraza.in" in production to share the cookie
  //     across subdomains.
  //   COOKIE_SAMESITE: "none" is required when the API and frontend are on
  //     different sites (cross-site cookie); "lax" when same-site.
  //   COOKIE_SECURE: defaults to true in production, false otherwise; can be
  //     forced on for cross-site "none" cookies during testing.
  COOKIE_DOMAIN: z.string().optional(),
  COOKIE_SAMESITE: z.enum(["lax", "strict", "none"]).optional(),
  COOKIE_SECURE: z
    .enum(["true", "false"])
    .optional()
    .transform((value) =>
      value === undefined ? undefined : value === "true"
    ),
});

function createEnv(env: NodeJS.ProcessEnv) {
  const safeParseResult = envSchema.safeParse(env);

  if (!safeParseResult.success) {
    // Fail fast with a readable, per-variable summary instead of a single
    // opaque JSON blob, so misconfiguration is obvious at startup.
    const issues = safeParseResult.error.issues
      .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\n` +
        `Check your .env file against .env.example.`
    );
  }

  return safeParseResult.data;
}

export const env = createEnv(process.env);
