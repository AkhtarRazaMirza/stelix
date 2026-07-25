import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

import {
  AppError,
  ValidationError,
} from "../errors/app.errors.js";
import { logger } from "../config/logger.js";
import type { AuthRequest } from "./auth.middleware.js";

export function errorMiddleware(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const authReq = req as AuthRequest;

  if (error instanceof AppError) {
    logger.warn(error.message, {
      userId: authReq.userId,
      requestId: authReq.requestId,
      route: req.path,
      code: error.code,
    });

    res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    });
    return;
  }

  if (error instanceof ZodError) {
    const validationError = new ValidationError(
      error.issues.map((issue) => issue.message).join(", ")
    );

    logger.warn(validationError.message, {
      userId: authReq.userId,
      requestId: authReq.requestId,
      route: req.path,
      code: validationError.code,
    });

    res.status(validationError.statusCode).json({
      error: validationError.message,
      code: validationError.code,
    });
    return;
  }

  logger.error("Unhandled server error", {
    userId: authReq.userId,
    requestId: authReq.requestId,
    route: req.path,
    error: error instanceof Error ? error.message : "Unknown error",
  });

  res.status(500).json({
    error: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}
