"use client";

import { memo } from "react";
import type { EmailSummary } from "@/types/gmail";

interface InboxPanelProps {
  emails: EmailSummary[];
  selectedId: string | null;
  onSelect: (email: EmailSummary) => void;
}

function senderName(from: string): string {
  const match = from.match(/^(.*?)</);
  const name = match ? match[1].trim().replace(/^"|"$/g, "") : from;
  return name.length > 0 ? name : from;
}

function formatDate(value: string): string {
  const date = new Date(value);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  return sameDay
    ? date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
}

function InboxPanelComponent({
  emails,
  selectedId,
  onSelect,
}: InboxPanelProps) {
  return (
    <div className="divide-y divide-white/5">
      {emails.map((email) => {
        const active = email.id === selectedId;

        return (
          <button
            key={email.id}
            onClick={() => onSelect(email)}
            className={`flex w-full flex-col gap-1 px-4 py-3 text-left transition ${
              active ? "bg-white/[0.06]" : "hover:bg-white/[0.03]"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {!email.isRead && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-blue-400" />
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
              </div>

              <span className="shrink-0 text-xs text-zinc-500">
                {formatDate(email.receivedAt)}
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
        );
      })}
    </div>
  );
}

export const InboxPanel = memo(InboxPanelComponent);
