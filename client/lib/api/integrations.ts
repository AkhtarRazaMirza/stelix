import { apiFetch } from "./client";

export function getIntegrations() {
  return apiFetch<{
    integrations: {
      id: string | null;
      provider: string;
      connected: boolean;
    }[];
  }>("/integrations");
}

export function connectIntegration(provider: string) {
  return apiFetch<{ url: string }>(
    `/integrations/${provider}/connect`,
    {
      method: "POST",
    }
  );
}

export function disconnectIntegration(id: string) {
  return apiFetch<{ success: boolean }>(`/integrations/${id}`, {
    method: "DELETE",
  });
}
