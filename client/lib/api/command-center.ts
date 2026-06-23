import { getInbox, getSentEmails } from "./gmail";
import { getEventsList } from "./calendar";
import { getIntegrations } from "./integrations";
import type { EmailSummary } from "@/types/gmail";
import type { EventSummary } from "@/types/calendar";

export type SectionStatus = "loading" | "connected" | "not-connected" | "error";

export interface CommandCenterMetrics {
  unreadEmails: number;
  meetingsToday: number;
  emailsSent: number;
  upcomingInvites: number;
}

export interface CommandCenterData {
  integrations: {
    gmail: boolean;
    calendar: boolean;
  };
  inbox: {
    status: SectionStatus;
    emails: EmailSummary[];
    unreadCount: number;
  };
  sentEmails: EmailSummary[];
  calendar: {
    status: SectionStatus;
    events: EventSummary[];
    upcoming: EventSummary[];
    todayCount: number;
  };
  metrics: CommandCenterMetrics;
}

function isToday(value: string): boolean {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return false;
  }
  const now = new Date();
  return date.toDateString() === now.toDateString();
}

function sortUpcoming(events: EventSummary[]): EventSummary[] {
  const now = Date.now();
  return events
    .filter((event) => {
      const start = new Date(event.startTime).getTime();
      return Number.isFinite(start) && start >= now;
    })
    .sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
}

/**
 * Aggregates inbox, calendar and integration data in parallel.
 * Each section degrades independently: a failure in one provider never
 * blocks the others, so the dashboard renders whatever is available.
 * Reuses the existing Gmail / Calendar / Integration API layer — no new
 * backend endpoints are introduced.
 */
export async function getCommandCenterData(): Promise<CommandCenterData> {
  const { integrations } = await getIntegrations();

  const gmailConnected = integrations.some(
    (item) => item.provider === "gmail" && item.connected
  );
  const calendarConnected = integrations.some(
    (item) => item.provider === "googlecalendar" && item.connected
  );

  const [inboxResult, sentResult, eventsResult] = await Promise.allSettled([
    gmailConnected ? getInbox() : Promise.resolve(null),
    gmailConnected ? getSentEmails() : Promise.resolve(null),
    calendarConnected ? getEventsList() : Promise.resolve(null),
  ]);

  const inboxEmails =
    inboxResult.status === "fulfilled" && inboxResult.value
      ? inboxResult.value.emails
      : [];

  const inboxStatus: SectionStatus = !gmailConnected
    ? "not-connected"
    : inboxResult.status === "rejected"
      ? "error"
      : "connected";

  const unreadCount = inboxEmails.filter((email) => !email.isRead).length;

  const emailsSent =
    sentResult.status === "fulfilled" && sentResult.value
      ? sentResult.value.emails.length
      : 0;

  const sentEmails =
    sentResult.status === "fulfilled" && sentResult.value
      ? sentResult.value.emails
      : [];

  const calendarEvents =
    eventsResult.status === "fulfilled" && eventsResult.value
      ? eventsResult.value.events
      : [];

  const calendarStatus: SectionStatus = !calendarConnected
    ? "not-connected"
    : eventsResult.status === "rejected"
      ? "error"
      : "connected";

  const upcoming = sortUpcoming(calendarEvents);
  const todayCount = calendarEvents.filter((event) =>
    isToday(event.startTime)
  ).length;

  return {
    integrations: {
      gmail: gmailConnected,
      calendar: calendarConnected,
    },
    inbox: {
      status: inboxStatus,
      emails: inboxEmails,
      unreadCount,
    },
    sentEmails,
    calendar: {
      status: calendarStatus,
      events: calendarEvents,
      upcoming,
      todayCount,
    },
    metrics: {
      unreadEmails: unreadCount,
      meetingsToday: todayCount,
      emailsSent,
      upcomingInvites: upcoming.length,
    },
  };
}

/* ------------------------------------------------------------------ *
 * Granular section fetchers.
 *
 * These power progressive rendering: the hook resolves integrations
 * first, then loads each section independently so the slowest provider
 * never blocks the others. They reuse the exact same API layer and
 * sub-shapes as getCommandCenterData() above — no new endpoints.
 * ------------------------------------------------------------------ */

export interface IntegrationsState {
  gmail: boolean;
  calendar: boolean;
}

export interface InboxSection {
  emails: EmailSummary[];
  unreadCount: number;
}

export interface CalendarSection {
  events: EventSummary[];
  upcoming: EventSummary[];
  todayCount: number;
}

export async function fetchIntegrationsState(): Promise<IntegrationsState> {
  const { integrations } = await getIntegrations();

  return {
    gmail: integrations.some(
      (item) => item.provider === "gmail" && item.connected
    ),
    calendar: integrations.some(
      (item) => item.provider === "googlecalendar" && item.connected
    ),
  };
}

export async function fetchInboxSection(): Promise<InboxSection> {
  const { emails } = await getInbox();
  return {
    emails,
    unreadCount: emails.filter((email) => !email.isRead).length,
  };
}

export async function fetchSentEmails(): Promise<EmailSummary[]> {
  const { emails } = await getSentEmails();
  return emails;
}

export async function fetchCalendarSection(): Promise<CalendarSection> {
  const { events } = await getEventsList();
  return {
    events,
    upcoming: sortUpcoming(events),
    todayCount: events.filter((event) => isToday(event.startTime)).length,
  };
}
