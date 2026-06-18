"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";

import { EmailList } from "@/components/email/email-list";

import { getEmails } from "@/lib/api/email";
import { getIntegrations } from "@/lib/api/integrations";
import { Email } from "@/types/email";

export default function InboxPage() {
  const router = useRouter();

  const [emails, setEmails] =
    useState<Email[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [notConnected, setNotConnected] =
    useState(false);

  useEffect(() => {
    async function loadEmails() {
      try {
        const { integrations } = await getIntegrations();

        const hasGmail = integrations.some(
          (i) => i.provider === "gmail"
        );

        if (!hasGmail) {
          setNotConnected(true);
          return;
        }

        const data = await getEmails();

        setEmails(data.emails);
      } catch {
        setError(
          "Failed to load emails."
        );
      } finally {
        setLoading(false);
      }
    }

    loadEmails();
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Inbox"
          description="Manage your emails."
        />

        {loading ? (
          <LoadingState />
        ) : notConnected ? (
          <EmptyState
            title="Gmail not connected"
            description="Connect your Gmail account to view your inbox."
          >
            <button
              onClick={() => router.push("/settings")}
              className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200"
            >
              Go to Settings
            </button>
          </EmptyState>
        ) : error ? (
          <ErrorState
            title="Unable to load emails"
            description={error}
          />
        ) : emails.length === 0 ? (
          <EmptyState
            title="No emails"
            description="Your inbox is empty."
          />
        ) : (
          <EmailList emails={emails} />
        )}
      </div>
    </AppShell>
  );
}