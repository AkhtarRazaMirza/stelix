import { apiFetch } from "./client";

export function getCurrentUser() {
  return apiFetch("/auth/me");
}

export function logout() {
  return apiFetch("/auth/logout", {
    method: "POST",
  });
}