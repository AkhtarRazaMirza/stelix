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

export function serverConfig() {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
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
