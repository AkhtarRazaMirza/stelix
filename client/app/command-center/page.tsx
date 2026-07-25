"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Mail,
  Calendar,
  Bot,
  Settings,
  PenSquare,
  CalendarPlus,
  Users,
} from "lucide-react";

import dynamic from "next/dynamic";

import { AppShell } from "@/components/layout/app-shell";
import { toDateTimeLocalValue } from "@/components/calendar/calendar-utils";

import { CommandBar } from "@/components/command-center/command-bar";
import { QuickActions } from "@/components/command-center/quick-actions";
import { InboxWidget } from "@/components/command-center/inbox-widget";
import { CalendarWidget } from "@/components/command-center/calendar-widget";
import { UpcomingMeetings } from "@/components/command-center/upcoming-meetings";
import { ProductivitySummary } from "@/components/command-center/productivity-summary";
import { ActivityFeed } from "@/components/command-center/activity-feed";
import { AiAssistantPanel } from "@/components/command-center/ai-assistant-panel";
import { CommandCenterLoadingState } from "@/components/command-center/loading-state";
import { CommandCenterErrorState } from "@/components/command-center/error-state";
import type { CommandItem } from "@/components/command-center/command-palette";

const ComposeEmailModal = dynamic(
  () => import("@/components/mail/compose-email-modal").then((m) => m.ComposeEmailModal),
  { ssr: false }
);
const CreateEventModal = dynamic(
  () => import("@/components/calendar/create-event-modal").then((m) => m.CreateEventModal),
  { ssr: false }
);
const EventDetails = dynamic(
  () => import("@/components/calendar/event-details").then((m) => m.EventDetails),
  { ssr: false }
);
const RescheduleModal = dynamic(
  () => import("@/components/calendar/reschedule-modal").then((m) => m.RescheduleModal),
  { ssr: false }
);
const CommandPalette = dynamic(
  () => import("@/components/command-center/command-palette").then((m) => m.CommandPalette),
  { ssr: false }
);

import { useCommandCenter } from "@/hooks/use-command-center";
import { getEvent } from "@/lib/api/calendar";
import { ApiError } from "@/lib/api/client";
import type { EventDetail } from "@/types/calendar";

function greetingForHour(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function CommandCenterPage() {
  const router = useRouter();
  const {
    integrations,
    integrationsReady,
    inbox,
    sent,
    calendar,
    metrics,
    refreshing,
    refresh,
  } = useCommandCenter();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createWithAttendees, setCreateWithAttendees] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventDetail | null>(null);
  const [rescheduleEvent, setRescheduleEvent] = useState<EventDetail | null>(
    null
  );

  // Global keyboard shortcuts:
  //   Cmd/Ctrl+K  toggle command palette
  //   C           compose email
  //   M           schedule meeting
  // Single-key shortcuts are ignored while typing in a field or when any
  // overlay (palette / modal / event drawer) is already open.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((prev) => !prev);
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const typing =
        target?.isContentEditable ||
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT";

      const overlayOpen =
        paletteOpen || composeOpen || createOpen || selectedEvent !== null;

      if (typing || overlayOpen) {
        return;
      }

      const key = event.key.toLowerCase();
      if (key === "c") {
        event.preventDefault();
        setComposeOpen(true);
      } else if (key === "m") {
        event.preventDefault();
        setCreateWithAttendees(true);
        setCreateOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, composeOpen, createOpen, selectedEvent]);

  const openEvent = useCallback(async (eventId: string) => {
    try {
      const { event } = await getEvent(eventId);
      setSelectedEvent(event);
    } catch (error) {
      if (error instanceof ApiError) {
        setSelectedEvent(null);
      }
    }
  }, []);

  const openCompose = useCallback(() => setComposeOpen(true), []);

  const openCreateEvent = useCallback(() => {
    setCreateWithAttendees(false);
    setCreateOpen(true);
  }, []);

  const openScheduleMeeting = useCallback(() => {
    setCreateWithAttendees(true);
    setCreateOpen(true);
  }, []);

  const defaultStart = useMemo(
    () => toDateTimeLocalValue(new Date(new Date().setMinutes(0, 0, 0))),
    []
  );
  const defaultEnd = useMemo(
    () => toDateTimeLocalValue(new Date(new Date().setMinutes(60, 0, 0))),
    []
  );

  // Static command palette entries: pages + quick actions.
  const staticCommands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        group: "Pages",
        icon: LayoutDashboard,
        keywords: "home overview",
        onSelect: () => router.push("/dashboard"),
      },
      {
        id: "nav-inbox",
        label: "Go to Inbox",
        group: "Pages",
        icon: Inbox,
        onSelect: () => router.push("/inbox"),
      },
      {
        id: "nav-mail",
        label: "Go to Mail",
        group: "Pages",
        icon: Mail,
        keywords: "email gmail",
        onSelect: () => router.push("/mail"),
      },
      {
        id: "nav-calendar",
        label: "Go to Calendar",
        group: "Pages",
        icon: Calendar,
        keywords: "events meetings schedule",
        onSelect: () => router.push("/calendar"),
      },
      {
        id: "nav-assistant",
        label: "Go to Assistant",
        group: "Pages",
        icon: Bot,
        keywords: "ai chat",
        onSelect: () => router.push("/assistant"),
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        group: "Pages",
        icon: Settings,
        keywords: "integrations connect",
        onSelect: () => router.push("/settings"),
      },
      {
        id: "action-compose",
        label: "Compose Email",
        group: "Actions",
        icon: PenSquare,
        keywords: "new message send write",
        onSelect: openCompose,
      },
      {
        id: "action-create-event",
        label: "Create Event",
        group: "Actions",
        icon: CalendarPlus,
        keywords: "new calendar add",
        onSelect: openCreateEvent,
      },
      {
        id: "action-schedule-meeting",
        label: "Schedule Meeting",
        group: "Actions",
        icon: Users,
        keywords: "invite attendees",
        onSelect: openScheduleMeeting,
      },
    ],
    [router, openCompose, openCreateEvent, openScheduleMeeting]
  );

  const hour = new Date().getHours();
  const greeting = greetingForHour(hour);

  if (!integrationsReady) {
    return (
      <AppShell>
        <CommandCenterLoadingState />
      </AppShell>
    );
  }

  const subtitleParts: string[] = [];
  if (integrations.gmail) {
    subtitleParts.push(
      `${inbox.unreadCount} unread email${inbox.unreadCount === 1 ? "" : "s"
      }`
    );
  }
  if (integrations.calendar) {
    subtitleParts.push(
      `${calendar.todayCount} meeting${calendar.todayCount === 1 ? "" : "s"
      } today`
    );
  }
  const subtitle =
    subtitleParts.length > 0
      ? `You have ${subtitleParts.join(" and ")}.`
      : "Connect Gmail and Calendar to power up your workspace.";

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl space-y-6">
        <CommandBar
          greeting={greeting}
          subtitle={subtitle}
          onOpenPalette={() => setPaletteOpen(true)}
          onRefresh={refresh}
          refreshing={refreshing}
        />

        <QuickActions
          onCompose={openCompose}
          onCreateEvent={openCreateEvent}
          onScheduleMeeting={openScheduleMeeting}
          onOpenInbox={() => router.push("/mail")}
          onOpenCalendar={() => router.push("/calendar")}
        />

        <ProductivitySummary
          metrics={metrics}
          gmailConnected={integrations.gmail}
          calendarConnected={integrations.calendar}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <InboxWidget
            status={inbox.status}
            emails={inbox.emails}
            unreadCount={inbox.unreadCount}
            onViewAll={() => router.push("/mail")}
            onConnect={() => router.push("/settings")}
            onRetry={refresh}
          />

          <CalendarWidget
            status={calendar.status}
            events={calendar.events}
            todayCount={calendar.todayCount}
            onSelectEvent={openEvent}
            onViewAll={() => router.push("/calendar")}
            onConnect={() => router.push("/settings")}
            onRetry={refresh}
          />
        </div>

        <UpcomingMeetings
          events={calendar.upcoming}
          onSelectEvent={openEvent}
        />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ActivityFeed
            sentEmails={sent.emails}
            recentEvents={calendar.upcoming}
          />

          <AiAssistantPanel onActionsCompleted={refresh} />
        </div>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        staticItems={staticCommands}
        gmailConnected={integrations.gmail}
        calendarConnected={integrations.calendar}
        onSelectEmail={() => router.push("/mail")}
        onSelectEvent={openEvent}
      />

      {composeOpen && (
        <ComposeEmailModal
          onClose={() => setComposeOpen(false)}
          onSent={refresh}
        />
      )}

      {createOpen && (
        <CreateEventModal
          key={createWithAttendees ? "meeting" : "event"}
          defaultStart={defaultStart}
          defaultEnd={defaultEnd}
          onClose={() => setCreateOpen(false)}
          onCreated={refresh}
        />
      )}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-full max-w-md border-l border-white/10 bg-[#0A0A0A]">
            <EventDetails
              event={selectedEvent}
              onClose={() => setSelectedEvent(null)}
              onReschedule={(event) => {
                setSelectedEvent(null);
                setRescheduleEvent(event);
              }}
              onUpdated={refresh}
              onDeleted={() => {
                setSelectedEvent(null);
                refresh();
              }}
            />
          </div>
        </div>
      )}

      {rescheduleEvent && (
        <RescheduleModal
          event={rescheduleEvent}
          onClose={() => setRescheduleEvent(null)}
          onRescheduled={refresh}
        />
      )}
    </AppShell>
  );
}
