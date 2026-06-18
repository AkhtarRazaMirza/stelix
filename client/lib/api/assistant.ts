import { apiFetch } from "./client";

export function sendMessage(message: string) {
  return apiFetch<{ response: string }>("/assistant", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}