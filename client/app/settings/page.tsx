"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

import { IntegrationCard } from "@/components/settings/integration-card";

import { getIntegrations } from "@/lib/api/integrations";

export default function SettingsPage() {
  const [integrations, setIntegrations] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      const data =
        await getIntegrations();

      setIntegrations(
        data.integrations
      );
    }

    load();
  }, []);
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Manage integrations and preferences."
        />

        <div className="grid gap-4 md:grid-cols-2">
          {integrations.map(
            (integration) => (
              <IntegrationCard
                key={integration.id}
                title={integration.provider}
                description={`Connect your ${integration.provider} account`}
                connected={
                  integration.connected
                }
              />
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}