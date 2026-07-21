import type { NextConfig } from "next";

/**
 * Content-Security-Policy and security headers for the Next.js frontend.
 *
 * This is where the *functional* CSP lives, because Next.js serves the HTML
 * documents, scripts, styles, and fonts. The Express API ships its own,
 * locked-down CSP (see server/src/config/security.ts).
 *
 * Allow-list rationale (do NOT tighten without testing the named feature):
 *   - script-src 'unsafe-inline'/'unsafe-eval': Next.js injects inline
 *     bootstrap scripts, and dev/HMR needs eval. Google Identity Services
 *     (accounts.google.com / gsi) is loaded for Google OAuth.
 *   - style-src 'unsafe-inline': Tailwind and Next inject inline styles;
 *     fonts.googleapis.com serves Google Fonts stylesheets.
 *   - font-src fonts.gstatic.com: Google Fonts files.
 *   - img-src Cloudinary + Google avatars + data/blob for inline/base64 images.
 *   - connect-src: the backend API origin (env-driven) plus Google OAuth
 *     endpoints; blob:/data: for client-side fetches.
 *   - frame-src accounts.google.com: Google OAuth popup/iframe.
 *   - frame-ancestors 'none' + X-Frame-Options DENY: clickjacking protection.
 */

// Derive the API origin from the public API URL so connect-src matches the
// real backend in every environment. NEXT_PUBLIC_API_URL is like
// "https://api.example.com/api"; we need just the origin for CSP.
function apiOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  try {
    return new URL(raw).origin;
  } catch {
    return "http://localhost:8000";
  }
}

function contentSecurityPolicy(): string {
  const api = apiOrigin();
  const isDev = process.env.NODE_ENV !== "production";

  // 'unsafe-eval' is only needed for the dev/HMR build; omit it in production.
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://accounts.google.com",
    "https://apis.google.com",
    "https://*.googleusercontent.com",
  ].join(" ");

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://*.googleusercontent.com https://lh3.googleusercontent.com`,
    `connect-src 'self' ${api} https://accounts.google.com https://apis.google.com data: blob:`,
    `frame-src 'self' https://accounts.google.com`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ];

  return directives.join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy(),
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            // Disable powerful features the app does not use.
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            // HSTS — pin HTTPS for a year including subdomains. Browsers ignore
            // this over plain http (localhost), so it is safe to send always.
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
