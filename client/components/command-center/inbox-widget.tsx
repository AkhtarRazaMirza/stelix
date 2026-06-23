"use client";

import { memo } from "react";
import { Mail, ArrowRight } from "lucide-react";

import type { EmailSummary } from "@/types/gmail";
import { WidgetCard } from "./widget-card";
import { CommandCenterEmptyState } from "./empty-state";
import { CommandCenterErrorState } from "./error-state";
import { WidgetSkeleton } from "./loading-state";
import type { SectionStatus } from "@/lib/api/command-center";
import { senderName, inboxTime } from "./utils";

interface InboxWidgetProps {
  status: SectionStatus;
  emails: EmailSummary[];
  unreadCount: number;
  onViewAll: () => void;
  onConnect: () => void;
  onRetry?: () => void;
}

const MAX_VISIBLE = 6;

function InboxWidgetComponent({
  status,
  emails,
  unreadCount,
  onViewAll,
  onConnect,
  onRetry,
}: InboxWidgetProps) {
  const visible = emails.slice(0, MAX_VISIBLE);

  return (
    <WidgetCard
      title="Inbox"
      icon={Mail}
      badge={
        unreadCount > 0 ? (
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-300">
            {unreadCount} unread
          </span>
        ) : null
      }
      action={
        status === "connected" && emails.length > 0 ? (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-zinc-400 transition hover:text-white"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </button>
        ) : null
      }
      className="min-h-[20rem]"
    >
      {status === "loading" ? (
        <WidgetSkeleton rows={5} />
      ) : status === "not-connected" ? (
        <div className="p-5">
          <CommandCenterEmptyState
            icon={Mail}
            title="No connected Gmail account"
            description="Connect Gmail to see your recent messages here."
            compact
          >
            <button
              onClick={onConnect}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Connect Gmail
            </button>
          </CommandCenterEmptyState>
        </div>
      ) : status === "error" ? (
        <div className="p-5">
          <CommandCenterErrorState
            title="Unable to load inbox"
            description="Gmail is temporarily unavailable."
            onRetry={onRetry}
            compact
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="p-5">
          <CommandCenterEmptyState
            icon={Mail}
            title="No recent emails"
            description="Your inbox is all caught up."
            compact
          />
        </div>
      ) : (
        <ul className="divide-y divide-white/5">
          {visible.map((email) => (
            <li key={email.id}>
              <button
                onClick={onViewAll}
                className="flex w-full flex-col gap-1 px-5 py-3 text-left transition hover:bg-white/[0.03]"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2">
                    {!email.isRead && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-blue-400"
                        aria-label="Unread"
                      />
                    )}
                    <span
                      className={`truncate text-sm ${
                        email.isRead
                          ? "text-zinc-400"
                          : "font-semibold text-white"
                      }`}
                    >
                      {senderName(email.from)}
                    </span>
                  </span>

                  <span className="shrink-0 text-xs text-zinc-500">
                    {inboxTime(email.receivedAt)}
                  </span>
                </div>

                <span
                  className={`truncate text-sm ${
                    email.isRead ? "text-zinc-400" : "text-white"
                  }`}
                >
                  {email.subject || "(no subject)"}
                </span>

                <span className="truncate text-xs text-zinc-500">
                  {email.snippet}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </WidgetCard>
  );
}

export const InboxWidget = memo(InboxWidgetComponent);
