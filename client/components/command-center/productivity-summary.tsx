"use client";

import { memo } from "react";
import {
  Mail,
  CalendarClock,
  Send,
  UserPlus,
  type LucideIcon,
} from "lucide-react";

import type { CommandCenterMetrics } from "@/lib/api/command-center";

interface ProductivitySummaryProps {
  metrics: CommandCenterMetrics;
  gmailConnected: boolean;
  calendarConnected: boolean;
}

interface Metric {
  id: string;
  label: string;
  value: number;
  icon: LucideIcon;
  available: boolean;
}

function MetricTile({ metric }: { metric: Metric }) {
  const Icon = metric.icon;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#111111] p-5">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300">
          <Icon className="h-4 w-4" />
        </span>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">
        {metric.available ? metric.value : "—"}
      </p>

      <p className="mt-1 text-sm text-zinc-500">{metric.label}</p>
    </div>
  );
}

function ProductivitySummaryComponent({
  metrics,
  gmailConnected,
  calendarConnected,
}: ProductivitySummaryProps) {
  const tiles: Metric[] = [
    {
      id: "unread",
      label: "Unread Emails",
      value: metrics.unreadEmails,
      icon: Mail,
      available: gmailConnected,
    },
    {
      id: "meetings-today",
      label: "Meetings Today",
      value: metrics.meetingsToday,
      icon: CalendarClock,
      available: calendarConnected,
    },
    {
      id: "emails-sent",
      label: "Emails Sent",
      value: metrics.emailsSent,
      icon: Send,
      available: gmailConnected,
    },
    {
      id: "upcoming-invites",
      label: "Upcoming Invites",
      value: metrics.upcomingInvites,
      icon: UserPlus,
      available: calendarConnected,
    },
  ];

  return (
    <section aria-label="Productivity summary">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((metric) => (
          <MetricTile key={metric.id} metric={metric} />
        ))}
      </div>
    </section>
  );
}

export const ProductivitySummary = memo(ProductivitySummaryComponent);
