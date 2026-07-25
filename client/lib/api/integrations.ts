import { apiFetch } from "./client";
import { invalidateCommandCenterCache } from "./command-center-cache";

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
  invalidateCommandCenterCache();
  return apiFetch<{ url: string }>(
    `/integrations/${provider}/connect`,
    {
      method: "POST",
    }
  );
}

export function disconnectIntegration(id: string) {
  invalidateCommandCenterCache();
  return apiFetch<{ success: boolean }>(`/integrations/${id}`, {
    method: "DELETE",
  });
}
