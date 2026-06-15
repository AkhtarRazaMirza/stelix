"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";

import { EventList } from "@/components/calendar/event-list";

import { getEvents } from "@/lib/api/calendar";
import { CalendarEvent } from "@/types/calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getEvents();
        setEvents(data.events);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
  }, []);
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Calendar"
          description="Manage meetings and events."
        />

        {loading ? (
          <LoadingState />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events"
            description="No upcoming events."
          />
        ) : (
          <EventList events={events} />
        )}
      </div>
    </AppShell>
  );
}