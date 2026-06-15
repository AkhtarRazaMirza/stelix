import { apiFetch } from "./client";

export function getEvents() {
  return apiFetch<{
    events: {
      id: string;
      title: string;
      start: string;
      end: string;
    }[];
  }>("/calendar");
}