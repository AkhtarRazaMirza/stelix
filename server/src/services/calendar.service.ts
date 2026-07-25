import { CorsairService } from "./corsair.service.js";
import { IntegrationGuard } from "./integration.guard.js";
import { NotFoundError } from "../errors/app.errors.js";
import type {
  CreateEventInput,
  EventDetail,
  EventListResult,
  EventSummary,
  RescheduleEventInput,
  UpdateEventFields,
} from "../types/calendar.types.js";

type CalendarEvent = {
  id?: string;
  summary?: string;
  start?: { dateTime?: string };
  end?: { dateTime?: string };
  status?: string;
  htmlLink?: string;
};

function mapEvent(event: CalendarEvent) {
  return {
    id: event.id ?? "",
    title: event.summary ?? "Untitled event",
    start: event.start?.dateTime ?? "",
    end: event.end?.dateTime ?? "",
    status: event.status ?? "",
    htmlLink: event.htmlLink ?? "",
  };
}

export type MappedCalendarEvent = ReturnType<typeof mapEvent>;

type CalendarDateTime = {
  date?: string;
  dateTime?: string;
};

type CalendarPerson = {
  email?: string;
  displayName?: string;
};

type CalendarAttendeeRaw = {
  email?: string;
  displayName?: string;
  responseStatus?: string;
  organizer?: boolean;
  optional?: boolean;
};

type RichCalendarEvent = {
  id?: string;
  summary?: string;
  description?: string;
  location?: string;
  status?: string;
  htmlLink?: string;
  start?: CalendarDateTime;
  end?: CalendarDateTime;
  organizer?: CalendarPerson;
  attendees?: CalendarAttendeeRaw[];
};

type EventListResponse = {
  items?: RichCalendarEvent[];
  nextPageToken?: string;
};

const DEFAULT_PAGE_SIZE = 50;

function resolveDateTime(value: CalendarDateTime | undefined): string {
  return value?.dateTime ?? value?.date ?? "";
}

function mapEventSummary(event: RichCalendarEvent): EventSummary {
  return {
    id: event.id ?? "",
    title: event.summary ?? "Untitled event",
    startTime: resolveDateTime(event.start),
    endTime: resolveDateTime(event.end),
    location: event.location ?? "",
    status: event.status ?? "",
    attendeeCount: event.attendees?.length ?? 0,
    htmlLink: event.htmlLink ?? "",
  };
}

function mapEventDetail(event: RichCalendarEvent): EventDetail {
  return {
    id: event.id ?? "",
    title: event.summary ?? "Untitled event",
    description: event.description ?? "",
    startTime: resolveDateTime(event.start),
    endTime: resolveDateTime(event.end),
    location: event.location ?? "",
    status: event.status ?? "",
    organizer: event.organizer
      ? {
          email: event.organizer.email ?? "",
          displayName: event.organizer.displayName ?? "",
        }
      : null,
    attendees: (event.attendees ?? []).map((attendee) => ({
      email: attendee.email ?? "",
      displayName: attendee.displayName ?? "",
      responseStatus: attendee.responseStatus ?? "needsAction",
      organizer: attendee.organizer ?? false,
      optional: attendee.optional ?? false,
    })),
    htmlLink: event.htmlLink ?? "",
  };
}

function toEventResource(
  fields: CreateEventInput | UpdateEventFields
): Record<string, unknown> {
  const resource: Record<string, unknown> = {};

  if ("title" in fields && fields.title !== undefined) {
    resource.summary = fields.title;
  }
  if (fields.description !== undefined) {
    resource.description = fields.description;
  }
  if (fields.location !== undefined) {
    resource.location = fields.location;
  }
  if (fields.startTime !== undefined) {
    resource.start = { dateTime: fields.startTime };
  }
  if (fields.endTime !== undefined) {
    resource.end = { dateTime: fields.endTime };
  }
  if (fields.attendees !== undefined) {
    resource.attendees = fields.attendees.map((email) => ({ email }));
  }

  return resource;
}

export class CalendarService {
  constructor(
    private readonly integrationGuard = new IntegrationGuard(),
    private readonly corsairService = new CorsairService()
  ) {}

  private resolveCalendar(userId: string) {
    const tenant = this.corsairService.resolveTenant(userId);
    return tenant.googlecalendar.api;
  }

  async getEvents(userId: string): Promise<MappedCalendarEvent[]> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "list_events"
    );

    const tenant = this.corsairService.resolveTenant(userId);
    const result = await tenant.googlecalendar.api.events.getMany({});

    return (result.items ?? []).map(mapEvent);
  }

  async getUpcomingEvents(
    userId: string,
    limit = 5
  ): Promise<MappedCalendarEvent[]> {
    const events = await this.getEvents(userId);
    const now = Date.now();

    return events
      .filter((event) => {
        const start = Date.parse(event.start);
        return Number.isFinite(start) && start >= now;
      })
      .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
      .slice(0, limit);
  }

  async listEvents(
    userId: string,
    pageToken?: string
  ): Promise<EventListResult> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "list_events_detailed"
    );

    const calendar = this.resolveCalendar(userId);

    const result = (await calendar.events.getMany({
      singleEvents: true,
      orderBy: "startTime",
      maxResults: DEFAULT_PAGE_SIZE,
      pageToken,
    })) as EventListResponse;

    return {
      events: (result.items ?? []).map(mapEventSummary),
      nextPageToken: result.nextPageToken ?? null,
    };
  }

  async searchEvents(
    userId: string,
    query: string
  ): Promise<EventListResult> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "search_events",
      { queryLength: query.length }
    );

    const calendar = this.resolveCalendar(userId);

    const result = (await calendar.events.getMany({
      q: query,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: DEFAULT_PAGE_SIZE,
    })) as EventListResponse;

    return {
      events: (result.items ?? []).map(mapEventSummary),
      nextPageToken: result.nextPageToken ?? null,
    };
  }

  async getUpcomingMeetings(
    userId: string,
    limit = 5
  ): Promise<EventSummary[]> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "upcoming_meetings"
    );

    const calendar = this.resolveCalendar(userId);

    const result = (await calendar.events.getMany({
      singleEvents: true,
      orderBy: "startTime",
      timeMin: new Date().toISOString(),
      maxResults: limit,
    })) as EventListResponse;

    return (result.items ?? []).map(mapEventSummary);
  }

  async getEvent(userId: string, eventId: string): Promise<EventDetail> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "get_event",
      { eventId }
    );

    const calendar = this.resolveCalendar(userId);

    const event = (await calendar.events.get({
      id: eventId,
    })) as RichCalendarEvent;

    if (!event.id) {
      throw new NotFoundError("Event not found");
    }

    return mapEventDetail(event);
  }

  async createEvent(
    userId: string,
    input: CreateEventInput,
    notifyAttendees = false
  ): Promise<EventDetail> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "create_event",
      { attendeeCount: input.attendees?.length ?? 0, notifyAttendees }
    );

    const calendar = this.resolveCalendar(userId);

    const event = (await calendar.events.create({
      event: toEventResource(input),
      sendUpdates: notifyAttendees ? "all" : "none",
    })) as RichCalendarEvent;

    return mapEventDetail(event);
  }

  async updateEvent(
    userId: string,
    eventId: string,
    fields: UpdateEventFields,
    notifyAttendees = false
  ): Promise<EventDetail> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "update_event",
      { eventId, notifyAttendees }
    );

    const calendar = this.resolveCalendar(userId);

    const event = (await calendar.events.update({
      id: eventId,
      event: toEventResource(fields),
      sendUpdates: notifyAttendees ? "all" : "none",
    })) as RichCalendarEvent;

    return mapEventDetail(event);
  }

  async rescheduleEvent(
    userId: string,
    input: RescheduleEventInput
  ): Promise<EventDetail> {
    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "reschedule_event",
      { eventId: input.eventId }
    );

    return this.updateEvent(
      userId,
      input.eventId,
      { startTime: input.startTime, endTime: input.endTime },
      true
    );
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    await this.integrationGuard.requireIntegration(userId, "googlecalendar");

    this.corsairService.logProviderOperation(
      userId,
      "googlecalendar",
      "delete_event",
      { eventId }
    );

    const calendar = this.resolveCalendar(userId);

    await calendar.events.delete({
      id: eventId,
      sendUpdates: "all",
    });
  }
}
