export interface CalendarAttendee {
  email: string;
  displayName: string;
  responseStatus: string;
  organizer: boolean;
  optional: boolean;
}

export interface EventOrganizer {
  email: string;
  displayName: string;
}

export interface EventSummary {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  attendeeCount: number;
  htmlLink: string;
}

export interface EventDetail {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  organizer: EventOrganizer | null;
  attendees: CalendarAttendee[];
  htmlLink: string;
}

export interface EventListResult {
  events: EventSummary[];
  nextPageToken: string | null;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
}

export interface UpdateEventFields {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  attendees?: string[];
}

export interface RescheduleEventInput {
  eventId: string;
  startTime: string;
  endTime: string;
}
