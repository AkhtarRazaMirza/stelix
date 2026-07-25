import type { Request, Response, NextFunction } from "express";
import { TokenService } from "../config/jwt.js";
import { UnauthorizedError } from "../errors/app.errors.js";
import type { RequestWithContext } from "./request-id.middleware.js";

export interface AuthRequest extends RequestWithContext {
  userId?: string;
}

const tokenService = new TokenService();

export function verifyAccessToken(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      throw new UnauthorizedError("No access token provided");
    }

    const decoded = tokenService.verifyAccessToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(
      error instanceof UnauthorizedError
        ? error
        : new UnauthorizedError("Unauthorized")
    );
  }
}

export function requireUserId(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  if (!req.userId) {
    next(new UnauthorizedError("User context is required"));
    return;
  }

  next();
}
