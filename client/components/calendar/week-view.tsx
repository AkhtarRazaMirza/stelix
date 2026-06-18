"use client";

import type { EventSummary } from "@/types/calendar";
import {
  addDays,
  eventsForDay,
  isSameDay,
  startOfWeek,
  timeLabel,
} from "./calendar-utils";

interface WeekViewProps {
  cursor: Date;
  events: EventSummary[];
  onSelectEvent: (eventId: string) => void;
}

export function WeekView({ cursor, events, onSelectEvent }: WeekViewProps) {
  const weekStart = startOfWeek(cursor);
  const days = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStart, index)
  );
  const today = new Date();

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((day) => {
        const dayEvents = eventsForDay(events, day);
        const isToday = isSameDay(day, today);

        return (
          <div
            key={day.toISOString()}
            className="min-h-[320px] rounded-xl border border-white/10 bg-[#111111] p-2"
          >
            <div className="mb-2 text-center">
              <p className="text-xs text-zinc-500">
                {day.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p
                className={`text-sm ${
                  isToday ? "font-semibold text-white" : "text-zinc-400"
                }`}
              >
                {day.getDate()}
              </p>
            </div>

            <div className="space-y-1.5">
              {dayEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => onSelectEvent(event.id)}
                  className="block w-full rounded-lg bg-blue-500/15 p-2 text-left transition hover:bg-blue-500/25"
                >
                  <p className="truncate text-xs font-medium text-blue-100">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-blue-300/70">
                    {timeLabel(event.startTime)}
                  </p>
                </button>
              ))}

              {dayEvents.length === 0 && (
                <p className="px-1 text-[11px] text-zinc-600">—</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
