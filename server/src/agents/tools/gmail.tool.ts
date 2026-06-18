import { GmailService } from "../../services/gmail.service.js";
import type { ToolDefinition, ToolExecutionResult } from "../agent.types.js";
import {
  getRequiredEmail,
  getRequiredString,
  getString,
} from "./tool-helpers.js";

/**
 * Gmail tools. Every tool delegates to the existing GmailService — no Gmail
 * API logic is reimplemented here. The service enforces integration
 * ownership via IntegrationGuard, and `userId` is always supplied by the
 * agent service from the authenticated request.
 */
export function createGmailTools(
  gmailService: GmailService = new GmailService()
): ToolDefinition[] {
  const sendEmail: ToolDefinition = {
    name: "send_email",
    category: "email",
    schema: {
      type: "function",
      function: {
        name: "send_email",
        description:
          "Send an email on behalf of the user via Gmail. Use this when the user wants to send, reply to, or compose a message.",
        parameters: {
          type: "object",
          properties: {
            to: {
              type: "string",
              description: "Recipient email address.",
            },
            subject: {
              type: "string",
              description:
                "Concise email subject line. Infer a sensible subject if the user did not provide one.",
            },
            body: {
              type: "string",
              description: "The full plain-text body of the email.",
            },
          },
          required: ["to", "subject", "body"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const to = getRequiredEmail(args, "to");
      const subject = getRequiredString(args, "subject");
      const body = getRequiredString(args, "body");

      const result = await gmailService.sendEmail(userId, {
        to,
        subject,
        body,
      });

      return {
        status: "success",
        category: "email",
        summary: `Email sent to ${to}`,
        data: { id: result.id, threadId: result.threadId, to, subject },
        detail: { to, subject },
      };
    },
  };

  const searchEmails: ToolDefinition = {
    name: "search_emails",
    category: "email",
    schema: {
      type: "function",
      function: {
        name: "search_emails",
        description:
          "Search the user's Gmail inbox. Use this to find emails from a person, about a topic, or matching keywords. Supports Gmail search syntax (e.g. 'from:sarah', 'subject:invoice').",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description:
                "The Gmail search query. Convert natural language into Gmail operators where helpful.",
            },
          },
          required: ["query"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const query = getRequiredString(args, "query");

      const page = await gmailService.searchEmails(userId, query);

      const emails = page.emails.slice(0, 10).map((email) => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        snippet: email.snippet,
        receivedAt: email.receivedAt,
      }));

      return {
        status: "success",
        category: "email",
        summary: `Found ${page.emails.length} matching email${
          page.emails.length === 1 ? "" : "s"
        }`,
        data: { count: page.emails.length, emails },
        detail: { count: page.emails.length, query },
      };
    },
  };

  const getInbox: ToolDefinition = {
    name: "get_inbox",
    category: "email",
    schema: {
      type: "function",
      function: {
        name: "get_inbox",
        description:
          "Get the user's most recent inbox emails. Use this when the user asks to see their inbox or recent emails without a specific search.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
        },
      },
    },
    execute: async (userId): Promise<ToolExecutionResult> => {
      const page = await gmailService.getInbox(userId);

      const emails = page.emails.slice(0, 10).map((email) => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        snippet: email.snippet,
        receivedAt: email.receivedAt,
        isRead: email.isRead,
      }));

      const unread = page.emails.filter((email) => !email.isRead).length;

      return {
        status: "success",
        category: "email",
        summary: `Loaded ${page.emails.length} inbox email${
          page.emails.length === 1 ? "" : "s"
        }`,
        data: { count: page.emails.length, unread, emails },
        detail: { count: page.emails.length, unread },
      };
    },
  };

  const getEmail: ToolDefinition = {
    name: "get_email",
    category: "email",
    schema: {
      type: "function",
      function: {
        name: "get_email",
        description:
          "Read the full content of a single email by its id. Use this after search_emails or get_inbox when the user wants the details of a specific message.",
        parameters: {
          type: "object",
          properties: {
            emailId: {
              type: "string",
              description:
                "The id of the email to read, as returned by search_emails or get_inbox.",
            },
          },
          required: ["emailId"],
        },
      },
    },
    execute: async (userId, args): Promise<ToolExecutionResult> => {
      const emailId = getRequiredString(args, "emailId");

      const email = await gmailService.getEmail(userId, emailId);

      const preview = getString({ body: email.body }, "body")?.slice(0, 2000);

      return {
        status: "success",
        category: "email",
        summary: `Opened email: ${email.subject || "(no subject)"}`,
        data: {
          id: email.id,
          from: email.from,
          to: email.to,
          subject: email.subject,
          body: preview ?? "",
          receivedAt: email.receivedAt,
        },
        detail: { subject: email.subject, from: email.from },
      };
    },
  };

  return [sendEmail, searchEmails, getInbox, getEmail];
}
