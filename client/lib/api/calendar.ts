import { apiFetch } from "./client";

export function getEvents() {
  return apiFetch("/calendar");
}

export function createEvent(data: unknown) {
  return apiFetch("/calendar", {
    method: "POST",
    body: JSON.stringify(data),
  });
}