"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";

import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

import { getDashboard } from "@/lib/api/dashboard";

type DashboardData = {
  emailCount: number;
  meetingCount: number;
  integrationCount: number;

  aiSummary: string;

  recentEmails: {
    id: string;
    from: string;
    subject: string;
    snippet?: string;
    receivedAt?: string;
  }[];

  upcomingEvents: {
    id: string;
    title: string;
    start?: string;
    end?: string;
  }[];
};

const CACHE_TTL_MS = 60_000;
let dashboardCache: { data: DashboardData; fetchedAt: number } | null = null;

export default function DashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(
    dashboardCache ? dashboardCache.data : null
  );

  const [loading, setLoading] = useState(!dashboardCache);

  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (background = false) => {
    try {
      if (!background) {
        setLoading(true);
      }

      const response = await getDashboard();

      dashboardCache = { data: response, fetchedAt: Date.now() };
      setData(response);
      setError("");
    } catch {
      if (!dashboardCache) {
        setError("Failed to load dashboard.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const isFresh =
      dashboardCache && Date.now() - dashboardCache.fetchedAt < CACHE_TTL_MS;
    if (!isFresh) {
      loadDashboard(Boolean(dashboardCache));
    }
  }, [loadDashboard]);

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
        ? "Good Afternoon"
        : "Good Evening";

  if (loading) {
    return (
      <AppShell>
        <LoadingState />
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell>
        <ErrorState
          title="Failed to load dashboard"
          description={error}
          onRetry={loadDashboard}
        />
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <EmptyState
          title="No dashboard data"
          description="Unable to load dashboard information."
        />
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">

        {/* Greeting */}

        <div>
          <h1 className="text-3xl font-bold">
            {greeting} 👋
          </h1>

          <p className="mt-2 text-zinc-400">
            You have{" "}
            {data.emailCount} emails and{" "}
            {data.meetingCount} upcoming
            meeting
            {data.meetingCount !== 1
              ? "s"
              : ""}
            .
          </p>
        </div>

        {/* Quick Actions */}

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            Quick Actions
          </h3>

          <div className="grid gap-3 md:grid-cols-4">

            <button
              onClick={() =>
                router.push(
                  "/assistant?prompt=Summarize%20my%20inbox"
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:border-white/20 hover:bg-zinc-800"
            >
              <p className="font-medium">
                📧 Summarize Inbox
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                AI inbox summary
              </p>
            </button>

            <button
              onClick={() =>
                router.push(
                  "/assistant?prompt=Show%20my%20calendar"
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:border-white/20 hover:bg-zinc-800"
            >
              <p className="font-medium">
                📅 Today's Meetings
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Upcoming events
              </p>
            </button>

            <button
              onClick={() =>
                router.push(
                  "/assistant?prompt=What%20should%20I%20focus%20on%20today?"
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:border-white/20 hover:bg-zinc-800"
            >
              <p className="font-medium">
                🎯 Focus Today
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Daily briefing
              </p>
            </button>

            <button
              onClick={() =>
                router.push(
                  "/assistant"
                )
              }
              className="rounded-xl border border-white/10 bg-zinc-900 p-4 text-left transition hover:border-white/20 hover:bg-zinc-800"
            >
              <p className="font-medium">
                🤖 Open Assistant
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Ask anything
              </p>
            </button>

          </div>
        </Card>

        {/* Stats */}

        <div className="grid gap-4 md:grid-cols-3">

          <StatCard
            title="Emails"
            value={data.emailCount}
            description="Inbox synced"
          />

          <StatCard
            title="Meetings"
            value={data.meetingCount}
            description="Upcoming events"
          />

          <StatCard
            title="Connected Apps"
            value={
              data.integrationCount
            }
            description="Active integrations"
          />

        </div>

        {/* AI Summary */}

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">
            AI Summary
          </h3>

          <p className="whitespace-pre-wrap text-zinc-300">
            {data.aiSummary}
          </p>
        </Card>

        {/* Emails + Events */}

        <div className="grid gap-4 md:grid-cols-2">

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Recent Emails
            </h3>

            {data.recentEmails
              .length === 0 ? (
              <EmptyState
                title="No emails"
                description="Inbox is empty."
              />
            ) : (
              <div className="space-y-4">
                {data.recentEmails.map(
                  (email) => (
                    <div
                      key={email.id}
                      className="border-b border-zinc-800 pb-3"
                    >
                      <p className="text-xs text-zinc-500">
                        {email.from}
                      </p>

                      <p className="font-medium">
                        {email.subject}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold">
              Upcoming Events
            </h3>

            {data.upcomingEvents
              .length === 0 ? (
              <EmptyState
                title="No events"
                description="No upcoming meetings."
              />
            ) : (
              <div className="space-y-4">
                {data.upcomingEvents.map(
                  (event) => (
                    <div
                      key={event.id}
                      className="border-b border-zinc-800 pb-3"
                    >
                      <p className="font-medium">
                        {event.title}
                      </p>

                      {event.start && (
                        <p className="text-xs text-zinc-500">
                          {new Date(
                            event.start
                          ).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )
                )}
              </div>
            )}
          </Card>

        </div>
      </div>
    </AppShell>
  );
}