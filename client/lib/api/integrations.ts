import { apiFetch } from "./client";

export function getIntegrations() {
  return apiFetch<{
    integrations: {
      id: string;
      provider: string;
      connected: boolean;
    }[];
  }>("/integrations");
}