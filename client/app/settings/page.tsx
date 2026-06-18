"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { IntegrationCard } from "@/components/settings/integration-card";

import {
  getCurrentUser,
  logout,
} from "@/lib/api/auth";

import {
  getIntegrations,
  connectIntegration,
  disconnectIntegration,
} from "@/lib/api/integrations";

type User = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

type Integration = {
  id: string | null;
  provider: string;
  connected: boolean;
};

const PROVIDER_LABELS: Record<string, string> = {
  gmail: "Gmail",
  googlecalendar: "Google Calendar",
};

function providerLabel(provider: string) {
  return PROVIDER_LABELS[provider] ?? provider;
}

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [integrations, setIntegrations] =
    useState<Integration[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState<string | null>(null);

  const [banner, setBanner] =
    useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadIntegrations = useCallback(async () => {
    const integrationData = await getIntegrations();
    setIntegrations(integrationData.integrations);
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [userData] = await Promise.all([
          getCurrentUser(),
          loadIntegrations(),
        ]);

        setUser(userData.user);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [loadIntegrations]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("connected");
    const error = params.get("error");

    if (connected) {
      setBanner({
        type: "success",
        message: `${providerLabel(connected)} connected successfully.`,
      });
    } else if (error) {
      setBanner({
        type: "error",
        message: "Failed to connect. Please try again.",
      });
    }

    if (connected || error) {
      router.replace("/settings");
    }
  }, [router]);

  async function handleLogout() {
    try {
      await logout();

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

  const handleConnect = useCallback(
    async (_id: string, provider: string) => {
      setActionLoading(provider);
      try {
        const { url } = await connectIntegration(provider);

        window.location.href = url;
      } catch (error) {
        console.error("Failed to connect:", error);
        setBanner({
          type: "error",
          message: "Failed to start the connection. Please try again.",
        });
        setActionLoading(null);
      }
    },
    []
  );

  const handleDisconnect = useCallback(
    async (id: string, provider: string) => {
      setActionLoading(provider);
      try {
        await disconnectIntegration(id);

        await loadIntegrations();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      } finally {
        setActionLoading(null);
      }
    },
    [loadIntegrations]
  );

  if (loading) {
    return (
      <AppShell>
        <div className="p-6">
          Loading settings...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Manage your account, integrations and preferences."
        />

        {banner && (
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              banner.type === "success"
                ? "border-green-500/20 bg-green-500/10 text-green-400"
                : "border-red-500/20 bg-red-500/10 text-red-400"
            }`}
          >
            {banner.message}
          </div>
        )}

        {/* Profile */}
        <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
          <h3 className="mb-6 text-lg font-semibold">
            Profile Information
          </h3>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-400">
                Full Name
              </p>

              <p className="mt-1">
                {user?.full_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">
                Email Address
              </p>

              <p className="mt-1">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-zinc-400">
                Member Since
              </p>

              <p className="mt-1">
                {user?.created_at
                  ? new Date(
                    user.created_at
                  ).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Integrations */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">
            Connected Services
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map(
              (integration) => (
                <IntegrationCard
                  key={integration.provider}
                  id={integration.id ?? ""}
                  title={providerLabel(integration.provider)}
                  description={`Connect your ${providerLabel(
                    integration.provider
                  )} account`}
                  connected={
                    integration.connected
                  }
                  loading={
                    actionLoading === integration.provider
                  }
                  onConnect={(_id) =>
                    handleConnect(_id, integration.provider)
                  }
                  onDisconnect={(id) =>
                    handleDisconnect(id, integration.provider)
                  }
                />
              )
            )}
          </div>
        </div>

        {/* Account */}
        <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
          <h3 className="mb-6 text-lg font-semibold">
            Account
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="rounded-lg border border-red-500 px-4 py-2 text-sm transition hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
