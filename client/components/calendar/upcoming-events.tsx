"use client";

import { Clock, Users } from "lucide-react";
import type { EventSummary } from "@/types/calendar";

interface UpcomingEventsProps {
  events: EventSummary[];
  onSelect?: (eventId: string) => void;
}

function countdownLabel(startTime: string): string {
  const start = new Date(startTime).getTime();
  if (!Number.isFinite(start)) {
    return "";
  }

  const diffMs = start - Date.now();
  if (diffMs <= 0) {
    return "Now";
  }

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) {
    return `in ${minutes}m`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `in ${hours}h`;
  }

  const days = Math.round(hours / 24);
  return `in ${days}d`;
}

function timeLabel(startTime: string): string {
  const date = new Date(startTime);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }
  return date.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function UpcomingEvents({ events, onSelect }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#111111] p-5">
        <h3 className="text-sm font-semibold text-white">Upcoming</h3>
        <p className="mt-3 text-sm text-zinc-500">No upcoming meetings.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] p-5">
      <h3 className="text-sm font-semibold text-white">Upcoming</h3>

      <div className="mt-3 space-y-2">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onSelect?.(event.id)}
            className="w-full rounded-lg border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-white">
                {event.title}
              </span>

              <span className="shrink-0 text-xs text-blue-400">
                {countdownLabel(event.startTime)}
              </span>
            </div>

            <div className="mt-1.5 flex items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLabel(event.startTime)}
              </span>

              {event.attendeeCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.attendeeCount}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
