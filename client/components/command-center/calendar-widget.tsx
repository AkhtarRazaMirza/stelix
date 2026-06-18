"use client";

import { memo } from "react";
import { Calendar, ArrowRight, MapPin } from "lucide-react";

import type { EventSummary } from "@/types/calendar";
import { WidgetCard } from "./widget-card";
import { CommandCenterEmptyState } from "./empty-state";
import { CommandCenterErrorState } from "./error-state";
import type { SectionStatus } from "@/lib/api/command-center";
import { clockTime } from "./utils";

interface CalendarWidgetProps {
  status: SectionStatus;
  events: EventSummary[];
  todayCount: number;
  onSelectEvent: (eventId: string) => void;
  onViewAll: () => void;
  onConnect: () => void;
  onRetry?: () => void;
}

function isToday(value: string): boolean {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return false;
  }
  return date.toDateString() === new Date().toDateString();
}

function eventStatus(startTime: string, endTime: string): "ended" | "live" | "upcoming" {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  if (Number.isFinite(end) && end < now) {
    return "ended";
  }
  if (Number.isFinite(start) && start <= now) {
    return "live";
  }
  return "upcoming";
}

const MAX_VISIBLE = 5;

function CalendarWidgetComponent({
  status,
  events,
  todayCount,
  onSelectEvent,
  onViewAll,
  onConnect,
  onRetry,
}: CalendarWidgetProps) {
  const todayEvents = events
    .filter((event) => isToday(event.startTime))
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, MAX_VISIBLE);

  return (
    <WidgetCard
      title="Today"
      icon={Calendar}
      badge={
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-medium text-zinc-300">
          {todayCount} meeting{todayCount === 1 ? "" : "s"}
        </span>
      }
      action={
        status === "connected" ? (
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
      {status === "not-connected" ? (
        <div className="p-5">
          <CommandCenterEmptyState
            icon={Calendar}
            title="No calendar connected"
            description="Connect Google Calendar to see today's schedule."
            compact
          >
            <button
              onClick={onConnect}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Connect Calendar
            </button>
          </CommandCenterEmptyState>
        </div>
      ) : status === "error" ? (
        <div className="p-5">
          <CommandCenterErrorState
            title="Unable to load calendar"
            description="Google Calendar is temporarily unavailable."
            onRetry={onRetry}
            compact
          />
        </div>
      ) : todayEvents.length === 0 ? (
        <div className="p-5">
          <CommandCenterEmptyState
            icon={Calendar}
            title="Nothing scheduled today"
            description="Enjoy the open calendar."
            compact
          />
        </div>
      ) : (
        <ul className="space-y-2 p-3">
          {todayEvents.map((event) => {
            const phase = eventStatus(event.startTime, event.endTime);
            const live = phase === "live";
            const ended = phase === "ended";

            return (
              <li key={event.id}>
                <button
                  onClick={() => onSelectEvent(event.id)}
                  className="flex w-full items-stretch gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <span
                    className={`w-1 shrink-0 rounded-full ${
                      live
                        ? "bg-blue-400"
                        : ended
                          ? "bg-zinc-700"
                          : "bg-white/30"
                    }`}
                    aria-hidden
                  />

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span
                        className={`truncate text-sm font-medium ${
                          ended ? "text-zinc-500" : "text-white"
                        }`}
                      >
                        {event.title}
                      </span>

                      {live && (
                        <span className="shrink-0 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-300">
                          Now
                        </span>
                      )}
                    </span>

                    <span className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                      <span>
                        {clockTime(event.startTime)} – {clockTime(event.endTime)}
                      </span>

                      {event.location && (
                        <span className="flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetCard>
  );
}

export const CalendarWidget = memo(CalendarWidgetComponent);
