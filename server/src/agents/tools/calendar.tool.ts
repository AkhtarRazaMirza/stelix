import { CalendarService } from "../../services/calendar.service.js";
import type { ToolDefinition, ToolExecutionResult } from "../agent.types.js";
import {
  getEmailList,
  getIsoDateTime,
  getRequiredIsoDateTime,
  getRequiredString,
  getString,
  ToolArgumentError,
} from "./tool-helpers.js";

const DEFAULT_DURATION_MS = 60 * 60 * 1000;

/**
 * Calendar tools. Every tool delegates to the existing CalendarService — no
 * Google Calendar API logic is reimplemented here. Ownership is enforced by
 * IntegrationGuard inside the service, and `userId` is injected by the agent
 * service from the authenticated request.
 */
export function createCalendarTools(
  calendarService: CalendarService = new CalendarService()
): ToolDefinition[] {
  const createEvent: ToolDefinition = {
    name: "create_calendar_event",
    category: "calendar",
    schema: {
      type: "function",
      function: {
        name: "create_calendar_event",
        description:
          "Create a calendar event or schedule a meeting. If attendees are provided, invitations are emailed automatically. Resolve relative dates (e.g. 'tomorrow at 3pm', 'next Thursday') to absolute ISO 8601 date-times before calling.",
        parameters: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description:
                "Event title. Infer a sensible title (e.g. 'Meeting') if the user did not specify one.",
            },
            startTime: {
              type: "string",
              description: "Event start in ISO 8601 format with timezone.",
            },
            endTime: {
              type: "string",
              description:
                "Event end in ISO 8601 format. If omitted, defaults to one hour after start.",
            },
            description: {
              type: "string",
              description: "Optional event description / agenda.",
            },
            location: {
              type: "string",
              description: "Optional event location.",
            },
            attendees: {
              type: "array",
              items: { type: "string" },
              description: "Optional list of attendee email addresses to invite.",
            },
          },
          required: ["title", "startTime"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const title = getRequiredString(args, "title");
      const startTime = getRequiredIsoDateTime(args, "startTime");

      let endTime = getIsoDateTime(args, "endTime");
      if (endTime === undefined) {
        endTime = new Date(
          Date.parse(startTime) + DEFAULT_DURATION_MS
        ).toISOString();
      }

      if (Date.parse(endTime) <= Date.parse(startTime)) {
        throw new ToolArgumentError("End time must be after start time.");
      }

      const attendees = getEmailList(args, "attendees");
      const description = getString(args, "description");
      const location = getString(args, "location");

      const event = await calendarService.createEvent(
        userId,
        {
          title,
          startTime,
          endTime,
          ...(description !== undefined ? { description } : {}),
          ...(location !== undefined ? { location } : {}),
          ...(attendees.length > 0 ? { attendees } : {}),
        },
        attendees.length > 0
      );

      const when = new Date(event.startTime).toLocaleString();

      return {
        status: "success",
        category: "calendar",
        summary:
          attendees.length > 0
            ? `Meeting "${event.title}" scheduled for ${when} with ${attendees.length} attendee${
                attendees.length === 1 ? "" : "s"
              }`
            : `Event "${event.title}" created for ${when}`,
        data: {
          id: event.id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
          attendees: event.attendees.map((a) => a.email),
          htmlLink: event.htmlLink,
        },
        detail: {
          title: event.title,
          startTime: event.startTime,
          attendeeCount: attendees.length,
        },
      };
    },
  };

  const updateEvent: ToolDefinition = {
    name: "update_calendar_event",
    category: "calendar",
    schema: {
      type: "function",
      function: {
        name: "update_calendar_event",
        description:
          "Update or reschedule an existing calendar event by id. Only include the fields that change. Use list_calendar_events first to find the event id.",
        parameters: {
          type: "object",
          properties: {
            eventId: {
              type: "string",
              description: "The id of the event to update.",
            },
            title: { type: "string", description: "New title." },
            startTime: {
              type: "string",
              description: "New start in ISO 8601 format.",
            },
            endTime: {
              type: "string",
              description: "New end in ISO 8601 format.",
            },
            description: { type: "string", description: "New description." },
            location: { type: "string", description: "New location." },
          },
          required: ["eventId"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const eventId = getRequiredString(args, "eventId");

      const title = getString(args, "title");
      const startTime = getIsoDateTime(args, "startTime");
      const endTime = getIsoDateTime(args, "endTime");
      const description = getString(args, "description");
      const location = getString(args, "location");

      if (
        title === undefined &&
        startTime === undefined &&
        endTime === undefined &&
        description === undefined &&
        location === undefined
      ) {
        throw new ToolArgumentError("Provide at least one field to update.");
      }

      if (
        startTime !== undefined &&
        endTime !== undefined &&
        Date.parse(endTime) <= Date.parse(startTime)
      ) {
        throw new ToolArgumentError("End time must be after start time.");
      }

      const event = await calendarService.updateEvent(
        userId,
        eventId,
        {
          ...(title !== undefined ? { title } : {}),
          ...(startTime !== undefined ? { startTime } : {}),
          ...(endTime !== undefined ? { endTime } : {}),
          ...(description !== undefined ? { description } : {}),
          ...(location !== undefined ? { location } : {}),
        },
        true
      );

      return {
        status: "success",
        category: "calendar",
        summary: `Event "${event.title}" updated`,
        data: {
          id: event.id,
          title: event.title,
          startTime: event.startTime,
          endTime: event.endTime,
        },
        detail: { title: event.title, startTime: event.startTime },
      };
    },
  };

  const deleteEvent: ToolDefinition = {
    name: "delete_calendar_event",
    category: "calendar",
    schema: {
      type: "function",
      function: {
        name: "delete_calendar_event",
        description:
          "Delete / cancel a calendar event by id. Attendees are notified. Use list_calendar_events first to find the event id.",
        parameters: {
          type: "object",
          properties: {
            eventId: {
              type: "string",
              description: "The id of the event to delete.",
            },
          },
          required: ["eventId"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const eventId = getRequiredString(args, "eventId");

      await calendarService.deleteEvent(userId, eventId);

      return {
        status: "success",
        category: "calendar",
        summary: "Event cancelled",
        data: { eventId, deleted: true },
        detail: { eventId },
      };
    },
  };

  const listEvents: ToolDefinition = {
    name: "list_calendar_events",
    category: "calendar",
    schema: {
      type: "function",
      function: {
        name: "list_calendar_events",
        description:
          "List the user's upcoming calendar events. Use this when the user asks what meetings or events they have. To filter by a person or keyword, prefer search_calendar_events.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    },
    execute: async (userId): Promise<ToolExecutionResult> => {
      const { events } = await calendarService.listEvents(userId);

      const mapped = events.slice(0, 15).map((event) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        attendeeCount: event.attendeeCount,
      }));

      return {
        status: "success",
        category: "calendar",
        summary: `Found ${events.length} event${events.length === 1 ? "" : "s"}`,
        data: { count: events.length, events: mapped },
        detail: { count: events.length },
      };
    },
  };

  const searchEvents: ToolDefinition = {
    name: "search_calendar_events",
    category: "calendar",
    schema: {
      type: "function",
      function: {
        name: "search_calendar_events",
        description:
          "Search the user's calendar events by keyword, attendee, or title. Use this to find a specific meeting.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query for matching events.",
            },
          },
          required: ["query"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const query = getRequiredString(args, "query");

      const { events } = await calendarService.searchEvents(userId, query);

      const mapped = events.slice(0, 15).map((event) => ({
        id: event.id,
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        attendeeCount: event.attendeeCount,
      }));

      return {
        status: "success",
        category: "calendar",
        summary: `Found ${events.length} matching event${
          events.length === 1 ? "" : "s"
        }`,
        data: { count: events.length, events: mapped },
        detail: { count: events.length, query },
      };
    },
  };

  return [createEvent, updateEvent, deleteEvent, listEvents, searchEvents];
}
