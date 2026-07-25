import { apiFetch } from "./client";
import { invalidateCommandCenterCache } from "./command-center-cache";
import type {
  CreateEventInput,
  EventDetail,
  EventSummary,
  RescheduleEventInput,
  UpdateEventInput,
} from "@/types/calendar";

export function getEvents() {
  return apiFetch<{
    events: {
      id: string;
      title: string;
      start: string;
      end: string;
      status: string;
      htmlLink?: string;
    }[];
  }>("/calendar");
}

export function getEventsList(pageToken?: string) {
  const query = pageToken
    ? `?pageToken=${encodeURIComponent(pageToken)}`
    : "";

  return apiFetch<{
    events: EventSummary[];
    nextPageToken: string | null;
  }>(`/calendar/events${query}`);
}

export function getUpcomingEvents() {
  return apiFetch<{
    events: {
      id: string;
      title: string;
      start: string;
      end: string;
      status: string;
      htmlLink?: string;
    }[];
  }>("/calendar/upcoming");
}

export function searchEvents(query: string) {
  return apiFetch<{
    events: EventSummary[];
    nextPageToken: string | null;
  }>(`/calendar/search?q=${encodeURIComponent(query)}`);
}

export function getEvent(eventId: string) {
  return apiFetch<{ event: EventDetail }>(
    `/calendar/events/${encodeURIComponent(eventId)}`
  );
}

export function createEvent(input: CreateEventInput) {
  invalidateCommandCenterCache(["todays-events", "dashboard-metrics"]);
  return apiFetch<{ event: EventDetail }>("/calendar/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateEvent(eventId: string, input: UpdateEventInput) {
  invalidateCommandCenterCache(["todays-events", "dashboard-metrics"]);
  return apiFetch<{ event: EventDetail }>(
    `/calendar/events/${encodeURIComponent(eventId)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export function deleteEvent(eventId: string) {
  invalidateCommandCenterCache(["todays-events", "dashboard-metrics"]);
  return apiFetch<{ success: boolean }>(
    `/calendar/events/${encodeURIComponent(eventId)}`,
    {
      method: "DELETE",
    }
  );
}

export function inviteAttendees(input: CreateEventInput) {
  invalidateCommandCenterCache(["todays-events", "dashboard-metrics"]);
  return apiFetch<{ event: EventDetail }>("/calendar/invite", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function rescheduleEvent(input: RescheduleEventInput) {
  invalidateCommandCenterCache(["todays-events", "dashboard-metrics"]);
  return apiFetch<{ event: EventDetail }>("/calendar/reschedule", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
