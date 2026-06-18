import { GmailService } from "../../services/gmail.service.js";
import { CalendarService } from "../../services/calendar.service.js";
import { IntegrationNotConnectedError } from "../../errors/app.errors.js";
import type { ToolDefinition, ToolExecutionResult } from "../agent.types.js";
import { getRequiredString } from "./tool-helpers.js";

/**
 * Unified search across Gmail and Google Calendar. Reuses both existing
 * services and runs them in parallel. Each surface degrades independently:
 * if one provider is not connected (or errors), the other still returns
 * results instead of failing the whole search.
 */
export function createSearchTool(
  gmailService: GmailService = new GmailService(),
  calendarService: CalendarService = new CalendarService()
): ToolDefinition {
  return {
    name: "search_all",
    category: "search",
    schema: {
      type: "function",
      function: {
        name: "search_all",
        description:
          "Search across BOTH emails and calendar events at once for a keyword or person. Use this when the user wants everything related to a topic and it is not clearly email-only or calendar-only.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The keyword, topic, or person to search for.",
            },
          },
          required: ["query"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const query = getRequiredString(args, "query");

      const [emailResult, eventResult] = await Promise.allSettled([
        gmailService.searchEmails(userId, query),
        calendarService.searchEvents(userId, query),
      ]);

      const emails =
        emailResult.status === "fulfilled"
          ? emailResult.value.emails.slice(0, 8).map((email) => ({
              id: email.id,
              from: email.from,
              subject: email.subject,
              snippet: email.snippet,
            }))
          : [];

      const events =
        eventResult.status === "fulfilled"
          ? eventResult.value.events.slice(0, 8).map((event) => ({
              id: event.id,
              title: event.title,
              startTime: event.startTime,
            }))
          : [];

      const emailError =
        emailResult.status === "rejected"
          ? describeRejection(emailResult.reason)
          : null;
      const eventError =
        eventResult.status === "rejected"
          ? describeRejection(eventResult.reason)
          : null;

      return {
        status: "success",
        category: "search",
        summary: `Found ${emails.length} email${
          emails.length === 1 ? "" : "s"
        } and ${events.length} event${events.length === 1 ? "" : "s"}`,
        data: {
          query,
          emails,
          events,
          ...(emailError ? { emailNote: emailError } : {}),
          ...(eventError ? { eventNote: eventError } : {}),
        },
        detail: { emailCount: emails.length, eventCount: events.length },
      };
    },
  };
}

function describeRejection(reason: unknown): string {
  if (reason instanceof IntegrationNotConnectedError) {
    return reason.message;
  }
  return "This source could not be searched.";
}
