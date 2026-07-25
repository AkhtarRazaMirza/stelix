import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodType } from "zod";

import { ValidationError } from "../errors/app.errors.js";
import { logger } from "../config/logger.js";
import type { AuthRequest } from "./auth.middleware.js";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as typeof req.params;
      }

      if (schemas.query) {
        const parsedQuery = schemas.query.parse(req.query);
        // Express 5 exposes req.query as a getter-only property, so it cannot
        // be reassigned directly. Redefine it with the validated value instead.
        Object.defineProperty(req, "query", {
          value: parsedQuery,
          writable: true,
          configurable: true,
        });
      }

      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new ValidationError(
            error.issues.map((issue) => issue.message).join(", ")
          )
        );
        return;
      }

      next(error);
    }
  };
}

export function asyncHandler(
  handler: (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req as AuthRequest, res, next)).catch(next);
  };
}
