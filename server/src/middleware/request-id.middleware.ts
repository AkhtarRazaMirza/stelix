import { randomUUID } from "node:crypto";

import type { NextFunction, Request, Response } from "express";

export interface RequestWithContext extends Request {
  requestId?: string;
}

export function requestIdMiddleware(
  req: RequestWithContext,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers["x-request-id"];
  req.requestId =
    typeof header === "string" && header.length > 0
      ? header
      : randomUUID();
  next();
}
