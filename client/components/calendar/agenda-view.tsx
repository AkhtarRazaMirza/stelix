"use client";

import { Clock, Users } from "lucide-react";
import type { EventSummary } from "@/types/calendar";
import { timeLabel } from "./calendar-utils";

interface AgendaViewProps {
  events: EventSummary[];
  onSelectEvent: (eventId: string) => void;
}

function dayKey(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "Undated";
  }
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function AgendaView({ events, onSelectEvent }: AgendaViewProps) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const groups = new Map<string, EventSummary[]>();
  for (const event of sorted) {
    const key = dayKey(event.startTime);
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }

  return (
    <div className="space-y-6">
      {Array.from(groups.entries()).map(([day, dayEvents]) => (
        <div key={day}>
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
            {day}
          </h3>

          <div className="space-y-2">
            {dayEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-[#111111] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.03]"
              >
                <div className="w-16 shrink-0 text-sm text-zinc-400">
                  {timeLabel(event.startTime)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">
                    {event.title}
                  </p>
                  {event.location && (
                    <p className="truncate text-xs text-zinc-500">
                      {event.location}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {timeLabel(event.startTime)} – {timeLabel(event.endTime)}
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
      ))}
    </div>
  );
}
