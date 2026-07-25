import { apiFetch, ApiError } from "./client";
import { invalidateCommandCenterCache } from "./command-center-cache";

export async function loginWithGoogle(idToken: string) {
  invalidateCommandCenterCache();
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
  invalidateCommandCenterCache();
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
  });
}

export { ApiError };