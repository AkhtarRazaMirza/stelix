"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

import { EmailList } from "@/components/email/email-list";

import { getEmails } from "@/lib/api/email";
import { Email } from "@/types/email";

export default function InboxPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmails() {
      try {
        const data = await getEmails();
        setEmails(data.emails);
      } catch (error) {
        console.error(error);
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