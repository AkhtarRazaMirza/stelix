"use client";

import { memo } from "react";
import {
  Activity,
  Send,
  CalendarPlus,
  type LucideIcon,
} from "lucide-react";

import type { EmailSummary } from "@/types/gmail";
import type { EventSummary } from "@/types/calendar";
import { WidgetCard } from "./widget-card";
import { CommandCenterEmptyState } from "./empty-state";

interface ActivityFeedProps {
  sentEmails: EmailSummary[];
  recentEvents: EventSummary[];
}

interface ActivityItem {
  id: string;
  icon: LucideIcon;
  text: string;
  detail: string;
  timestamp: number;
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 0) {
    return "scheduled";
  }
  const minutes = Math.round(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const MAX_ITEMS = 6;

/**
 * The feed is intentionally derived from real Gmail/Calendar data only.
 * Priority 5 (AI agent) can push synthetic activity items into the same
 * shape, so the rendering layer is already future-ready.
 */
function buildActivity(
  sentEmails: EmailSummary[],
  recentEvents: EventSummary[]
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const email of sentEmails.slice(0, MAX_ITEMS)) {
    const ts = new Date(email.receivedAt).getTime();
    items.push({
      id: `sent-${email.id}`,
      icon: Send,
      text: "Email sent",
      detail: email.subject || `To ${email.to}`,
      timestamp: Number.isFinite(ts) ? ts : 0,
    });
  }

  for (const event of recentEvents.slice(0, MAX_ITEMS)) {
    const ts = new Date(event.startTime).getTime();
    items.push({
      id: `event-${event.id}`,
      icon: CalendarPlus,
      text: "Meeting scheduled",
      detail: event.title,
      timestamp: Number.isFinite(ts) ? ts : 0,
    });
  }

  return items.sort((a, b) => b.timestamp - a.timestamp).slice(0, MAX_ITEMS);
}

function ActivityFeedComponent({
  sentEmails,
  recentEvents,
}: ActivityFeedProps) {
  const items = buildActivity(sentEmails, recentEvents);

  return (
    <WidgetCard title="Activity" icon={Activity} className="min-h-[12rem]">
      {items.length === 0 ? (
        <div className="p-5">
          <CommandCenterEmptyState
            icon={Activity}
            title="No recent activity"
            description="Your sent emails and new meetings will appear here."
            compact
          />
        </div>
      ) : (
        <ul className="space-y-1 p-3">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <li
                key={item.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2.5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300">
                  <Icon className="h-3.5 w-3.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-white">
                      {item.text}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500">
                      {item.timestamp > 0 ? relativeTime(item.timestamp) : ""}
                    </span>
                  </span>
                  <span className="block truncate text-xs text-zinc-500">
                    {item.detail}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}

export const ActivityFeed = memo(ActivityFeedComponent);
