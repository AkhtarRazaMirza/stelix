"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  fetchIntegrationsState,
  fetchInboxSection,
  fetchSentEmails,
  fetchCalendarSection,
  type CommandCenterData,
  type CommandCenterMetrics,
  type SectionStatus,
} from "@/lib/api/command-center";
import type { EmailSummary } from "@/types/gmail";
import type { EventSummary } from "@/types/calendar";

interface InboxState {
  status: SectionStatus;
  emails: EmailSummary[];
  unreadCount: number;
}

interface CalendarState {
  status: SectionStatus;
  events: EventSummary[];
  upcoming: EventSummary[];
  todayCount: number;
}

interface SentState {
  status: SectionStatus;
  emails: EmailSummary[];
}

export interface CommandCenterState {
  /** Best-known integration connection state. */
  integrations: { gmail: boolean; calendar: boolean };
  /** True once the integrations request has resolved (success or failure). */
  integrationsReady: boolean;
  inbox: InboxState;
  sent: SentState;
  calendar: CalendarState;
  /** Derived from whatever section data has arrived so far. */
  metrics: CommandCenterMetrics;
  /** Background refresh in flight (cache already shown). */
  refreshing: boolean;
  refresh: () => Promise<void>;
}

// Module-level cache so navigating away and back is instant; the hook
// shows cached data immediately and revalidates in the background.
const CACHE_TTL_MS = 60_000;
let cache: { data: CommandCenterData; fetchedAt: number } | null = null;

const INITIAL_INBOX: InboxState = {
  status: "loading",
  emails: [],
  unreadCount: 0,
};
const INITIAL_SENT: SentState = { status: "loading", emails: [] };
const INITIAL_CALENDAR: CalendarState = {
  status: "loading",
  events: [],
  upcoming: [],
  todayCount: 0,
};

function inboxFromCache(data: CommandCenterData): InboxState {
  return {
    status: data.inbox.status,
    emails: data.inbox.emails,
    unreadCount: data.inbox.unreadCount,
  };
}

function sentFromCache(data: CommandCenterData): SentState {
  return {
    status: data.inbox.status,
    emails: data.sentEmails,
  };
}

function calendarFromCache(data: CommandCenterData): CalendarState {
  return {
    status: data.calendar.status,
    events: data.calendar.events,
    upcoming: data.calendar.upcoming,
    todayCount: data.calendar.todayCount,
  };
}

function deriveMetrics(
  inbox: InboxState,
  sent: SentState,
  calendar: CalendarState
): CommandCenterMetrics {
  return {
    unreadEmails: inbox.unreadCount,
    meetingsToday: calendar.todayCount,
    emailsSent: sent.emails.length,
    upcomingInvites: calendar.upcoming.length,
  };
}

export function useCommandCenter(): CommandCenterState {
  const [integrations, setIntegrations] = useState(
    cache ? cache.data.integrations : { gmail: false, calendar: false }
  );
  const [integrationsReady, setIntegrationsReady] = useState(Boolean(cache));

  const [inbox, setInbox] = useState<InboxState>(
    cache ? inboxFromCache(cache.data) : INITIAL_INBOX
  );
  const [sent, setSent] = useState<SentState>(
    cache ? sentFromCache(cache.data) : INITIAL_SENT
  );
  const [calendar, setCalendar] = useState<CalendarState>(
    cache ? calendarFromCache(cache.data) : INITIAL_CALENDAR
  );

  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  // Tracks the latest load so a stale in-flight request can't overwrite
  // newer state after a refresh.
  const runId = useRef(0);

  const load = useCallback(async (background: boolean) => {
    const id = ++runId.current;
    const isCurrent = () => mounted.current && id === runId.current;

    if (background) {
      setRefreshing(true);
    } else {
      setIntegrationsReady(false);
      setInbox((prev) => ({ ...prev, status: "loading" }));
      setSent((prev) => ({ ...prev, status: "loading" }));
      setCalendar((prev) => ({ ...prev, status: "loading" }));
    }

    // Accumulate the assembled snapshot for the module cache.
    const snapshot: Partial<CommandCenterData> = {};

    const [integrationsRes, inboxRes, sentRes, calendarRes] =
      await Promise.allSettled([
        fetchIntegrationsState(),
        fetchInboxSection(),
        fetchSentEmails(),
        fetchCalendarSection(),
      ]);

    if (!isCurrent()) return;

    if (integrationsRes.status === "rejected") {
      setInbox((prev) => ({ ...prev, status: "error" }));
      setSent((prev) => ({ ...prev, status: "error" }));
      setCalendar((prev) => ({ ...prev, status: "error" }));
      setIntegrationsReady(true);
      setRefreshing(false);
      return;
    }

    const integrationsState = integrationsRes.value;
    setIntegrations(integrationsState);
    setIntegrationsReady(true);
    snapshot.integrations = integrationsState;

    // Inbox
    if (integrationsState.gmail && inboxRes.status === "fulfilled") {
      setInbox({ status: "connected", ...inboxRes.value });
      snapshot.inbox = { status: "connected", ...inboxRes.value };
    } else if (integrationsState.gmail) {
      setInbox({ status: "error", emails: [], unreadCount: 0 });
    } else {
      setInbox({ status: "not-connected", emails: [], unreadCount: 0 });
      snapshot.inbox = { status: "not-connected", emails: [], unreadCount: 0 };
    }

    // Sent
    if (integrationsState.gmail && sentRes.status === "fulfilled") {
      setSent({ status: "connected", emails: sentRes.value });
      snapshot.sentEmails = sentRes.value;
    } else if (integrationsState.gmail) {
      setSent({ status: "error", emails: [] });
    } else {
      setSent({ status: "not-connected", emails: [] });
      snapshot.sentEmails = [];
    }

    // Calendar
    if (integrationsState.calendar && calendarRes.status === "fulfilled") {
      setCalendar({ status: "connected", ...calendarRes.value });
      snapshot.calendar = { status: "connected", ...calendarRes.value };
    } else if (integrationsState.calendar) {
      setCalendar({
        status: "error",
        events: [],
        upcoming: [],
        todayCount: 0,
      });
    } else {
      setCalendar({
        status: "not-connected",
        events: [],
        upcoming: [],
        todayCount: 0,
      });
      snapshot.calendar = {
        status: "not-connected",
        events: [],
        upcoming: [],
        todayCount: 0,
      };
    }

    if (isCurrent()) {
      setRefreshing(false);
    }

    // Persist a fully-assembled snapshot only when every section settled
    // into a non-loading state, so the cache always represents a complete
    // view for instant back-navigation.
    if (
      snapshot.integrations &&
      snapshot.inbox &&
      snapshot.sentEmails &&
      snapshot.calendar
    ) {
      cache = {
        data: {
          integrations: snapshot.integrations,
          inbox: snapshot.inbox,
          sentEmails: snapshot.sentEmails,
          calendar: snapshot.calendar,
          metrics: {
            unreadEmails: snapshot.inbox.unreadCount,
            meetingsToday: snapshot.calendar.todayCount,
            emailsSent: snapshot.sentEmails.length,
            upcomingInvites: snapshot.calendar.upcoming.length,
          },
        },
        fetchedAt: Date.now(),
      };
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    const fresh = cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
    if (!fresh) {
      // No cache → cold load; stale cache → background revalidate.
      load(Boolean(cache));
    }

    return () => {
      mounted.current = false;
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  const metrics = useMemo(
    () => deriveMetrics(inbox, sent, calendar),
    [inbox, sent, calendar]
  );

  return {
    integrations,
    integrationsReady,
    inbox,
    sent,
    calendar,
    metrics,
    refreshing,
    refresh,
  };
}
