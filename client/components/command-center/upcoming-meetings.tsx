"use client";

import { memo } from "react";
import { Clock3, Users } from "lucide-react";

import type { EventSummary } from "@/types/calendar";
import { WidgetCard } from "./widget-card";
import { CommandCenterEmptyState } from "./empty-state";
import { relativeCountdown, dayAndTime } from "./utils";

interface UpcomingMeetingsProps {
  events: EventSummary[];
  onSelectEvent: (eventId: string) => void;
}

const MAX_VISIBLE = 4;

function isImminent(startTime: string): boolean {
  const diff = new Date(startTime).getTime() - Date.now();
  return diff > 0 && diff <= 15 * 60_000;
}

function UpcomingMeetingsComponent({
  events,
  onSelectEvent,
}: UpcomingMeetingsProps) {
  const visible = events.slice(0, MAX_VISIBLE);

  return (
    <WidgetCard title="Upcoming Meetings" icon={Clock3} className="min-h-[12rem]">
      {visible.length === 0 ? (
        <div className="p-5">
          <CommandCenterEmptyState
            icon={Clock3}
            title="No upcoming meetings"
            description="Your schedule is clear ahead."
            compact
          />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          {visible.map((event) => {
            const imminent = isImminent(event.startTime);

            return (
              <li key={event.id}>
                <button
                  onClick={() => onSelectEvent(event.id)}
                  className={`flex w-full flex-col gap-2 rounded-xl border p-4 text-left transition hover:bg-white/[0.04] ${
                    imminent
                      ? "border-blue-500/30 bg-blue-500/[0.06]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="truncate text-sm font-medium text-white">
                      {event.title}
                    </span>
                  </div>

                  <span
                    className={`text-sm font-semibold ${
                      imminent ? "text-blue-300" : "text-zinc-300"
                    }`}
                  >
                    Starts {relativeCountdown(event.startTime)}
                  </span>

                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{dayAndTime(event.startTime)}</span>

                    {event.attendeeCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {event.attendeeCount} attendee
                        {event.attendeeCount === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}

export const UpcomingMeetings = memo(UpcomingMeetingsComponent);
