import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "../env.js";
import { authRoutes } from "../routes/auth.router.js";
import { emailRoutes } from "../routes/email.routes.js";
import { calendarRoutes } from "../routes/calendar.routes.js";
import { integrationRoutes } from "../routes/integration.routes.js";
import { assistantRoutes } from "../routes/assistant.routes.js";
import { agentRoutes } from "../routes/agent.routes.js";
import { dashboardRoutes } from "../routes/dashboard.routes.js";
import { gmailRoutes } from "../routes/gmail.routes.js";
import { requestIdMiddleware } from "../middleware/request-id.middleware.js";
import { errorMiddleware } from "../middleware/error.middleware.js";
import { rateLimit } from "../middleware/rate-limit.middleware.js";
import { securityHeaders } from "./security.js";
import { csrfProtection, CSRF_HEADER } from "../middleware/csrf.middleware.js";

export function serverConfig() {
  const app = express();

  // Trust the reverse proxy (Render/Vercel) so req.secure, req.ip, and the
  // rate limiter see the real client protocol and address, and secure cookies
  // are emitted correctly behind TLS termination.
  app.set("trust proxy", 1);

  // Security headers first so they apply to every response, including errors.
  app.use(securityHeaders());

  app.use(requestIdMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
      // Allow the CSRF custom header on cross-site requests so the browser's
      // preflight succeeds. Content-Type is required for JSON request bodies.
      allowedHeaders: ["Content-Type", "Authorization", CSRF_HEADER],
    })
  );

  app.get("/api/health", (_req, res) => {
    res.send({
      success: true,
      status: 200,
      message: "server is up and running",
    });
  });

  // Global rate limit: 100 requests per minute per user/IP
  app.use(rateLimit({ windowMs: 60_000, maxRequests: 100 }));

  // CSRF protection for cookie-authenticated, state-changing requests. Placed
  // after cookieParser (needs req.cookies) and CORS (OPTIONS preflight is a
  // safe method and is exempt). See middleware/csrf.middleware.ts for why the
  // custom-header pattern is the correct fit for this cookie + JSON-API setup.
  app.use(csrfProtection);

  app.use("/api/auth", authRoutes);
  app.use("/api/emails", emailRoutes);
  app.use("/api/calendar", calendarRoutes);
  app.use("/api/integrations", integrationRoutes);
  app.use("/api/assistant", assistantRoutes);
  app.use("/api/agent", agentRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/gmail", gmailRoutes);

  app.use(errorMiddleware);

  return app;
}
