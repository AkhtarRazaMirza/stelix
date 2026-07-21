import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

/**
 * Unit tests for the security hardening added in this phase:
 *   - environment-driven cookie options (config/cookie.ts)
 *   - CSRF custom-header protection (middleware/csrf.middleware.ts)
 *
 * These are pure/mocked and require no database or network.
 */

// --- Cookie configuration -------------------------------------------------

async function loadCookieModule(overrides: Record<string, unknown>) {
  vi.resetModules();
  vi.doMock("../env.js", () => ({
    env: {
      NODE_ENV: "development",
      COOKIE_DOMAIN: undefined,
      COOKIE_SAMESITE: undefined,
      COOKIE_SECURE: undefined,
      ...overrides,
    },
  }));
  return import("../config/cookie.js");
}

describe("baseAuthCookieOptions", () => {
  afterEach(() => {
    vi.resetModules();
    vi.doUnmock("../env.js");
  });

  it("uses safe local defaults in development (lax, not secure, host-only)", async () => {
    const { baseAuthCookieOptions } = await loadCookieModule({
      NODE_ENV: "development",
    });

    const options = baseAuthCookieOptions();

    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("lax");
    expect(options.secure).toBe(false);
    expect(options.domain).toBeUndefined();
    expect(options.path).toBe("/");
  });

  it("defaults to cross-site secure cookie in production", async () => {
    const { baseAuthCookieOptions } = await loadCookieModule({
      NODE_ENV: "production",
    });

    const options = baseAuthCookieOptions();

    expect(options.sameSite).toBe("none");
    expect(options.secure).toBe(true);
  });

  it("honours an explicit production cookie domain", async () => {
    const { baseAuthCookieOptions } = await loadCookieModule({
      NODE_ENV: "production",
      COOKIE_DOMAIN: ".stelix.akhtarraza.in",
    });

    expect(baseAuthCookieOptions().domain).toBe(".stelix.akhtarraza.in");
  });

  it("forces secure on whenever sameSite is none (browser requirement)", async () => {
    const { baseAuthCookieOptions } = await loadCookieModule({
      NODE_ENV: "development",
      COOKIE_SAMESITE: "none",
      COOKIE_SECURE: false,
    });

    const options = baseAuthCookieOptions();

    expect(options.sameSite).toBe("none");
    // secure must be true even though COOKIE_SECURE=false was requested.
    expect(options.secure).toBe(true);
  });

  it("respects an explicit COOKIE_SAMESITE=lax override", async () => {
    const { baseAuthCookieOptions } = await loadCookieModule({
      NODE_ENV: "production",
      COOKIE_SAMESITE: "lax",
    });

    const options = baseAuthCookieOptions();

    expect(options.sameSite).toBe("lax");
  });
});

// --- CSRF protection ------------------------------------------------------

import { csrfProtection, CSRF_HEADER } from "../middleware/csrf.middleware.js";

function mockReqRes(
  overrides: {
    method?: string;
    headers?: Record<string, unknown>;
    cookies?: Record<string, unknown>;
  } = {}
) {
  const req = {
    method: overrides.method ?? "POST",
    headers: overrides.headers ?? {},
    cookies: overrides.cookies ?? {},
    path: "/api/test",
  } as any;
  const res = {} as any;
  const next = vi.fn();
  return { req, res, next };
}

describe("csrfProtection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("allows safe methods without the custom header", () => {
    const { req, res, next } = mockReqRes({ method: "GET" });
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("allows OPTIONS preflight without the header", () => {
    const { req, res, next } = mockReqRes({ method: "OPTIONS" });
    csrfProtection(req, res, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("rejects a cookie-authenticated POST missing the custom header", () => {
    const { req, res, next } = mockReqRes({
      method: "POST",
      cookies: { accessToken: "jwt" },
      headers: {},
    });

    csrfProtection(req, res, next);

    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(403);
  });

  it("allows a cookie-authenticated POST that includes the custom header", () => {
    const { req, res, next } = mockReqRes({
      method: "POST",
      cookies: { accessToken: "jwt" },
      headers: { [CSRF_HEADER]: "1" },
    });

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("exempts bearer-token requests that carry no auth cookie", () => {
    const { req, res, next } = mockReqRes({
      method: "POST",
      cookies: {},
      headers: { authorization: "Bearer sometoken" },
    });

    csrfProtection(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
