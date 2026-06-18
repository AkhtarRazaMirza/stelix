"use client";

import { Clock, MapPin, Users } from "lucide-react";
import type { EventSummary } from "@/types/calendar";
import { eventsForDay, timeLabel } from "./calendar-utils";

interface DayViewProps {
  cursor: Date;
  events: EventSummary[];
  onSelectEvent: (eventId: string) => void;
}

export function DayView({ cursor, events, onSelectEvent }: DayViewProps) {
  const dayEvents = eventsForDay(events, cursor);

  if (dayEvents.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
        <p className="text-sm text-zinc-400">
          No events on{" "}
          {cursor.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {dayEvents.map((event) => (
        <button
          key={event.id}
          onClick={() => onSelectEvent(event.id)}
          className="flex w-full items-start gap-4 rounded-xl border border-white/10 bg-[#111111] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.03]"
        >
          <div className="w-20 shrink-0 text-sm text-zinc-400">
            {timeLabel(event.startTime)}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">{event.title}</p>

            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeLabel(event.startTime)} – {timeLabel(event.endTime)}
              </span>

              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {event.location}
                </span>
              )}

              {event.attendeeCount > 0 && (
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {event.attendeeCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
