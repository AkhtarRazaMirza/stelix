import { apiFetch, ApiError } from "./client";

export async function register(data: {
  fullName: string;
  email: string;
  password: string;
}) {
  return apiFetch<{ user: { id: string; fullName: string; email: string; emailVerified: boolean } }>(
    "/auth/register",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function login(data: {
  email: string;
  password: string;
}) {
  return apiFetch<{ user: { id: string; fullName: string; email: string; profileImageUrl: string | null; emailVerified: boolean } }>(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
}

export async function loginWithGoogle(idToken: string) {
  return apiFetch<{ user: { id: string; fullName: string; email: string; profileImageUrl: string | null; emailVerified: boolean } }>(
    "/auth/google",
    {
      method: "POST",
      body: JSON.stringify({ idToken }),
    }
  );
}

export async function getCurrentUser() {
  return apiFetch<{
    user: {
      id: string;
      full_name: string;
      email: string;
      created_at: string;
    };
  }>("/auth/me");
}

export async function logout() {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export { ApiError };