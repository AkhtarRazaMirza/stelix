"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { getDashboard } from "@/lib/api/dashboard";

type DashboardData = {
  emailCount: number;
  meetingCount: number;
  integrationCount: number;

  aiSummary: string;

  recentEmails: {
    id: string;
    subject: string;
  }[];

  upcomingEvents: {
    id: string;
    title: string;
  }[];
};

export default function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(
      null
    );

  async function loadDashboard() {
    const response =
      await getDashboard();

    setData(response);
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!data) {
    return (
      <AppShell>
        <div>Loading...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Manage email, calendar and AI workflows."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Emails"
            value={String(
              data.emailCount
            )}
          />

          <StatCard
            title="Meetings"
            value={String(
              data.meetingCount
            )}
          />

          <StatCard
            title="Connected Apps"
            value={String(
              data.integrationCount
            )}
          />
        </div>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            AI Summary
          </h3>

          <p className="whitespace-pre-wrap text-zinc-300">
            {data.aiSummary}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Recent Emails
            </h3>

            <div className="space-y-2">
              {data.recentEmails.map(
                (email) => (
                  <p key={email.id}>
                    {email.subject}
                  </p>
                )
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Upcoming Events
            </h3>

            <div className="space-y-2">
              {data.upcomingEvents.map(
                (event) => (
                  <p key={event.id}>
                    {event.title}
                  </p>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}