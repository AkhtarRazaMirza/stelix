import helmet from "helmet";
import type { RequestHandler } from "express";
import { env } from "../env.js";

/**
 * Security headers for the Express API.
 *
 * This server returns JSON (and OAuth redirects) — it does not serve HTML
 * documents, scripts, styles, or fonts. A browser-enforced Content-Security-
 * Policy therefore acts as defense-in-depth (it only bites if an endpoint ever
 * returns HTML, e.g. an error page), so we ship a deliberately locked-down
 * policy: nothing is allowed to load. The user-facing CSP that must permit
 * Google Fonts, Cloudinary, Google OAuth, Groq, etc. lives on the Next.js
 * frontend (see client/next.config.ts) because that is where HTML is rendered.
 *
 * Cross-origin policy notes:
 *   - crossOriginResourcePolicy is set to "cross-origin" because the frontend
 *     is served from a different origin and consumes this API cross-site.
 *     (fetch() is governed by CORS, but keeping CORP permissive avoids any
 *     surprise when responses are embedded, e.g. images/avatars.)
 *   - crossOriginEmbedderPolicy is disabled: enabling it would require every
 *     cross-origin resource to opt in via CORP/CORS and can break OAuth popups
 *     and third-party flows. It provides no benefit for a JSON API.
 *   - HSTS is only meaningful over HTTPS; browsers ignore it on http://
 *     localhost, so enabling it unconditionally is safe for local dev.
 */
export function securityHeaders(): RequestHandler {
  const isProduction = env.NODE_ENV === "production";

  return helmet({
    // Locked-down CSP appropriate for a JSON API. 'self' + 'none' means no
    // scripts, styles, objects, or frames can be loaded from any API response.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'self'"],
      },
    },

    // Send HSTS in production so browsers pin HTTPS for a year (with
    // subdomains + preload). Harmless in dev where it is served over http.
    strictTransportSecurity: isProduction
      ? {
          maxAge: 31_536_000, // 1 year
          includeSubDomains: true,
          preload: true,
        }
      : false,

    // X-Content-Type-Options: nosniff — prevents MIME sniffing.
    xContentTypeOptions: true,

    // X-Frame-Options: DENY — clickjacking protection (belt-and-braces with
    // the frame-ancestors CSP directive above).
    frameguard: { action: "deny" },

    // Referrer-Policy — do not leak full URLs to third parties.
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },

    // Allow the frontend (different origin) to embed API resources such as
    // avatar images without tripping Cross-Origin-Resource-Policy.
    crossOriginResourcePolicy: { policy: "cross-origin" },

    // Disabled — see note above; COEP breaks cross-origin OAuth flows.
    crossOriginEmbedderPolicy: false,

    // Hide the framework fingerprint (also removed by express, kept explicit).
    hidePoweredBy: true,
  });
}
