const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000/api";

export class ApiError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // CSRF protection: the API requires this custom header on
        // state-changing requests. A cross-site attacker cannot set it
        // without triggering a CORS preflight that the API rejects. The
        // value is not a secret — its presence is what the server checks.
        "x-csrf-protection": "1",
        ...options?.headers,
      },
    }
  );

  if (response.status === 401) {
    // Session expired or missing. Redirect to login, preserving the current
    // page as the post-login destination. Guard against SSR and redirect loops
    // (don't redirect if already on an auth page).
    if (typeof window !== "undefined") {
      const { pathname } = window.location;
      const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/signup");
      if (!isAuthPage) {
        window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      }
    }
    throw new ApiError("Session expired. Please sign in again.", "UNAUTHORIZED");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(
      body.error ?? "Request failed",
      body.code ?? "UNKNOWN_ERROR"
    );
  }

  return response.json();
}