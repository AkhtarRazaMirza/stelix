import { apiFetch } from "./client";

export function sendMessage(message: string) {
  return apiFetch("/assistant/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
    }),
  });
}