"use client";

import type { EventSummary } from "@/types/calendar";
import {
  addDays,
  eventsForDay,
  isSameDay,
  startOfMonthGrid,
  timeLabel,
} from "./calendar-utils";

interface MonthViewProps {
  cursor: Date;
  events: EventSummary[];
  onSelectEvent: (eventId: string) => void;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MonthView({ cursor, events, onSelectEvent }: MonthViewProps) {
  const gridStart = startOfMonthGrid(cursor);
  const days = Array.from({ length: 42 }, (_, index) =>
    addDays(gridStart, index)
  );
  const today = new Date();

  return (
    <div className="overflow-hidden rounded-xl border border-white/10">
      <div className="grid grid-cols-7 border-b border-white/10 bg-[#111111]">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="px-2 py-2 text-center text-xs font-medium text-zinc-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayEvents = eventsForDay(events, day);
          const inMonth = day.getMonth() === cursor.getMonth();
          const isToday = isSameDay(day, today);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[96px] border-b border-r border-white/5 p-1.5 ${
                inMonth ? "bg-[#0A0A0A]" : "bg-[#0A0A0A]/40"
              }`}
            >
              <div
                className={`mb-1 text-xs ${
                  isToday
                    ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white font-semibold text-black"
                    : inMonth
                      ? "text-zinc-400"
                      : "text-zinc-600"
                }`}
              >
                {day.getDate()}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event.id)}
                    className="block w-full truncate rounded bg-blue-500/15 px-1.5 py-0.5 text-left text-[11px] text-blue-200 transition hover:bg-blue-500/25"
                  >
                    {timeLabel(event.startTime)} {event.title}
                  </button>
                ))}

                {dayEvents.length > 3 && (
                  <p className="px-1 text-[11px] text-zinc-500">
                    +{dayEvents.length - 3} more
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
