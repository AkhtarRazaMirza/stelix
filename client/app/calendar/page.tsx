"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

import { SearchEvents } from "@/components/calendar/search-events";
import { UpcomingEvents } from "@/components/calendar/upcoming-events";
import { MonthView } from "@/components/calendar/month-view";
import { WeekView } from "@/components/calendar/week-view";
import { DayView } from "@/components/calendar/day-view";
import { AgendaView } from "@/components/calendar/agenda-view";
import { EventDetails } from "@/components/calendar/event-details";
import { CreateEventModal } from "@/components/calendar/create-event-modal";
import { RescheduleModal } from "@/components/calendar/reschedule-modal";
import { CalendarLoadingState } from "@/components/calendar/loading-state";
import { CalendarEmptyState } from "@/components/calendar/empty-state";
import { CalendarErrorState } from "@/components/calendar/error-state";
import {
  addDays,
  monthLabel,
  toDateTimeLocalValue,
} from "@/components/calendar/calendar-utils";

import {
  getEventsList,
  searchEvents,
  getEvent,
} from "@/lib/api/calendar";
import { getIntegrations } from "@/lib/api/integrations";
import { ApiError } from "@/lib/api/client";
import type {
  CalendarView,
  EventDetail,
  EventSummary,
} from "@/types/calendar";

type PageState = "loading" | "ready" | "error" | "not-connected";

const VIEWS: { value: CalendarView; label: string }[] = [
  { value: "month", label: "Month" },
  { value: "week", label: "Week" },
  { value: "day", label: "Day" },
  { value: "agenda", label: "Agenda" },
];

function upcomingFrom(events: EventSummary[]): EventSummary[] {
  const now = Date.now();
  return events
    .filter((event) => {
      const start = new Date(event.startTime).getTime();
      return Number.isFinite(start) && start >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    )
    .slice(0, 5);
}

export default function CalendarPage() {
  const router = useRouter();

  const [view, setView] = useState<CalendarView>("month");
  const [cursor, setCursor] = useState<Date>(new Date());

  const [events, setEvents] = useState<EventSummary[]>([]);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [selected, setSelected] = useState<EventDetail | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<EventDetail | null>(
    null
  );

  const loadEvents = useCallback(async () => {
    try {
      const { integrations } = await getIntegrations();
      const calendar = integrations.find(
        (item) => item.provider === "googlecalendar"
      );

      if (!calendar?.connected) {
        setPageState("not-connected");
        return;
      }

      const data = await getEventsList();
      setEvents(data.events);
      setPageState("ready");
    } catch {
      setPageState("error");
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const data = await getEventsList();
      setEvents(data.events);
      setPageState("ready");
    } catch {
      setPageState("error");
    } finally {
      setRefreshing(false);
    }
  }

  const handleSearch = useCallback(async (query: string) => {
    setSearching(true);
    try {
      const data = await searchEvents(query);
      setEvents(data.events);
      setView("agenda");
      setPageState("ready");
    } catch {
      setPageState("error");
    } finally {
      setSearching(false);
    }
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearching(true);
    loadEvents().finally(() => setSearching(false));
  }, [loadEvents]);

  const handleSelectEvent = useCallback(async (eventId: string) => {
    try {
      const { event } = await getEvent(eventId);
      setSelected(event);
    } catch (error) {
      if (error instanceof ApiError) {
        setSelected(null);
      }
    }
  }, []);

  function shiftCursor(direction: number) {
    if (view === "month") {
      setCursor(
        new Date(cursor.getFullYear(), cursor.getMonth() + direction, 1)
      );
    } else if (view === "week") {
      setCursor(addDays(cursor, direction * 7));
    } else {
      setCursor(addDays(cursor, direction));
    }
  }

  function rangeLabel(): string {
    if (view === "day") {
      return cursor.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
    if (view === "agenda") {
      return "All events";
    }
    return monthLabel(cursor);
  }

  const defaultStart = toDateTimeLocalValue(
    new Date(new Date().setMinutes(0, 0, 0))
  );
  const defaultEnd = toDateTimeLocalValue(
    new Date(new Date().setMinutes(60, 0, 0))
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHeader
            title="Calendar"
            description="Your meeting command center."
          />

          <div className="flex items-center gap-2">
            <SearchEvents
              onSearch={handleSearch}
              onClear={handleClearSearch}
              searching={searching}
            />

            <button
              onClick={handleRefresh}
              disabled={refreshing || pageState === "loading"}
              className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Event
            </button>
          </div>
        </div>

        {pageState === "loading" ? (
          <CalendarLoadingState />
        ) : pageState === "not-connected" ? (
          <CalendarEmptyState
            title="No calendar connected"
            description="Connect Google Calendar to manage your events."
          >
            <button
              onClick={() => router.push("/settings")}
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200"
            >
              Go to Settings
            </button>
          </CalendarEmptyState>
        ) : pageState === "error" ? (
          <CalendarErrorState
            title="Unable to load calendar"
            description="Something went wrong while loading your events."
            onRetry={loadEvents}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => shiftCursor(-1)}
                    className="rounded-lg border border-white/10 p-2 transition hover:bg-white/5"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => setCursor(new Date())}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5"
                  >
                    Today
                  </button>

                  <button
                    onClick={() => shiftCursor(1)}
                    className="rounded-lg border border-white/10 p-2 transition hover:bg-white/5"
                    aria-label="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>

                  <span className="ml-2 text-sm font-medium text-white">
                    {rangeLabel()}
                  </span>
                </div>

                <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-[#111111] p-1">
                  {VIEWS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setView(item.value)}
                      className={`rounded-md px-3 py-1.5 text-sm transition ${
                        view === item.value
                          ? "bg-white/10 text-white"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* View */}
              {events.length === 0 ? (
                <CalendarEmptyState
                  title="No events found"
                  description="Create your first event to get started."
                />
              ) : view === "month" ? (
                <MonthView
                  cursor={cursor}
                  events={events}
                  onSelectEvent={handleSelectEvent}
                />
              ) : view === "week" ? (
                <WeekView
                  cursor={cursor}
                  events={events}
                  onSelectEvent={handleSelectEvent}
                />
              ) : view === "day" ? (
                <DayView
                  cursor={cursor}
                  events={events}
                  onSelectEvent={handleSelectEvent}
                />
              ) : (
                <AgendaView
                  events={events}
                  onSelectEvent={handleSelectEvent}
                />
              )}
            </div>

            <div className="space-y-4">
              <UpcomingEvents
                events={upcomingFrom(events)}
                onSelect={handleSelectEvent}
              />
            </div>
          </div>
        )}
      </div>

      {/* Details drawer */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
          <div className="h-full w-full max-w-md border-l border-white/10 bg-[#0A0A0A]">
            <EventDetails
              event={selected}
              onClose={() => setSelected(null)}
              onReschedule={(event) => {
                setSelected(null);
                setRescheduleTarget(event);
              }}
              onDeleted={() => {
                setSelected(null);
                loadEvents();
              }}
            />
          </div>
        </div>
      )}

      {createOpen && (
        <CreateEventModal
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
          onClose={() => setCreateOpen(false)}
          onCreated={loadEvents}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          event={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          onRescheduled={loadEvents}
        />
      )}
    </AppShell>
  );
}
