import { env } from "../env.js";

/**
 * Centralised, environment-driven cookie configuration for the auth cookie.
 *
 * Previously these attributes were hardcoded (secure:true, sameSite:"none",
 * domain:".stelix.akhtarraza.in"), which broke local development and preview
 * deployments and made logout unreliable (clearCookie must use the SAME
 * attributes the cookie was set with).
 *
 * Resolution rules:
 *   - secure:   COOKIE_SECURE if set, else true in production, false otherwise.
 *   - sameSite: COOKIE_SAMESITE if set, else "none" in production (cross-site
 *               API/frontend), "lax" in development.
 *   - domain:   COOKIE_DOMAIN if set, else undefined (host-only cookie — the
 *               correct default for localhost, Render *.onrender.com, and
 *               Vercel preview URLs where a fixed parent domain does not apply).
 *
 * Note: browsers require secure:true whenever sameSite is "none". When a
 * "none" cookie is requested without secure, we force secure on to keep the
 * cookie valid rather than silently dropping it.
 */
export type CookieSameSite = "lax" | "strict" | "none";

export interface AuthCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: CookieSameSite;
  domain?: string;
  path: string;
}

function resolveSecure(sameSite: CookieSameSite): boolean {
  const configured =
    env.COOKIE_SECURE ??
    (env.NODE_ENV === "production" ? true : false);

  // sameSite:"none" is only honoured by browsers on secure cookies.
  return sameSite === "none" ? true : configured;
}

function resolveSameSite(): CookieSameSite {
  if (env.COOKIE_SAMESITE) {
    return env.COOKIE_SAMESITE;
  }
  return env.NODE_ENV === "production" ? "none" : "lax";
}

/**
 * Base attributes shared by both setting and clearing the cookie. maxAge is
 * intentionally excluded here so the same base can be reused for clearCookie,
 * which must match every attribute EXCEPT maxAge/expires.
 */
export function baseAuthCookieOptions(): AuthCookieOptions {
  const sameSite = resolveSameSite();

  const options: AuthCookieOptions = {
    httpOnly: true,
    secure: resolveSecure(sameSite),
    sameSite,
    path: "/",
  };

  if (env.COOKIE_DOMAIN) {
    options.domain = env.COOKIE_DOMAIN;
  }

  return options;
}
