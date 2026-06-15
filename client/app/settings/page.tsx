"use client";

import { useEffect, useState } from "react";
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
} from "@/lib/api/integrations";

type User = {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
};

type Integration = {
  id: string;
  provider: string;
  connected: boolean;
};

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  const [integrations, setIntegrations] =
    useState<Integration[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [userData, integrationData] =
          await Promise.all([
            getCurrentUser(),
            getIntegrations(),
          ]);

        setUser(userData.user);

        setIntegrations(
          integrationData.integrations
        );
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleLogout() {
    try {
      await logout();

      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

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
                  key={integration.id}
                  title={
                    integration.provider
                  }
                  description={`Connect your ${integration.provider} account`}
                  connected={
                    integration.connected
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