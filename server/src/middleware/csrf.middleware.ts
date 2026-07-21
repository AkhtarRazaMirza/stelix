import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../errors/app.errors.js";
import type { AuthRequest } from "./auth.middleware.js";
import { logger } from "../config/logger.js";

/**
 * CSRF protection via the OWASP "Custom Request Header" pattern.
 *
 * Why this approach:
 *   Authentication uses an httpOnly cookie that is sent cross-site
 *   (sameSite="none" in production). That makes the API a CSRF target, so a
 *   defense is genuinely required. Because the frontend is a JavaScript SPA
 *   talking to a JSON API, the simplest robust defense is to require a custom
 *   request header on every state-changing request:
 *
 *     - A browser will NOT attach a custom header on a cross-site request
 *       (a form/img/navigation cannot set headers), and any fetch/XHR that
 *       tries to set one becomes a "non-simple" request, forcing a CORS
 *       preflight. Our CORS config only allows the known frontend origin, so
 *       a malicious origin's preflight is rejected and the request never runs.
 *     - This needs no server-side token storage and no per-request token
 *       plumbing, so it does not disturb the existing auth flow.
 *
 * Safe (non-mutating) methods are exempt. Requests that are not
 * cookie-authenticated (e.g. a future Authorization: Bearer header) are also
 * exempt, because header-based auth is inherently immune to CSRF.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// Header the frontend must send on state-changing requests. The value is not
// a secret — its presence is what matters (see rationale above).
export const CSRF_HEADER = "x-csrf-protection";

export function csrfProtection(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (SAFE_METHODS.has(req.method)) {
    next();
    return;
  }

  // Only cookie-authenticated requests are vulnerable to CSRF. If the caller
  // authenticates with a bearer token instead of the auth cookie, skip the
  // check (the browser cannot forge an Authorization header cross-site).
  const usesAuthCookie = Boolean(req.cookies?.accessToken);
  const usesBearer = req.headers.authorization?.startsWith("Bearer ");
  if (!usesAuthCookie && usesBearer) {
    next();
    return;
  }

  if (req.headers[CSRF_HEADER] === undefined) {
    logger.warn("CSRF check failed: missing custom header", {
      requestId: (req as AuthRequest).requestId,
      route: req.path,
      method: req.method,
    });
    next(new ForbiddenError("CSRF validation failed"));
    return;
  }

  next();
}
