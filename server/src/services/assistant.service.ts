import { getGroqClient } from "../config/ai.js";
import { logger } from "../config/logger.js";
import { db } from "../config/db.js";
import { aiChatsTable } from "../db/schema.js";
import { EmailService } from "./email.service.js";
import { CalendarService } from "./calendar.service.js";
import { IntegrationNotConnectedError } from "../errors/app.errors.js";
import { eq, desc } from "drizzle-orm";

type AssistantIntent = "focus" | "summarize" | "calendar" | "email" | "unknown";

const VALID_INTENTS: AssistantIntent[] = ["focus", "summarize", "calendar", "email", "unknown"];

export class AssistantService {
  constructor(
    private readonly emailService = new EmailService(),
    private readonly calendarService = new CalendarService()
  ) { }

  async handle(userId: string, message: string) {
    logger.info("Assistant request received", {
      userId,
      messageLength: message.length,
    });

    // Persist user message
    await db.insert(aiChatsTable).values({
      userId,
      role: "user",
      message,
    });

    const intent = await this.classifyIntent(message);

    logger.info("Assistant intent classified", {
      userId,
      intent,
    });

    let response: string;
    switch (intent) {
      case "focus":
        response = await this.getFocusToday(userId);
        break;
      case "summarize":
        response = await this.summarizeInbox(userId);
        break;
      case "calendar":
        response = await this.getCalendarSummary(userId);
        break;
      case "email":
        response = await this.getInboxSummary(userId);
        break;
      default:
        response = this.getHelpMessage();
        break;
    }

    // Persist assistant response
    await db.insert(aiChatsTable).values({
      userId,
      role: "assistant",
      message: response,
    });

    return response;
  }

  private async classifyIntent(message: string): Promise<AssistantIntent> {
    try {
      const groq = getGroqClient();

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an intent classifier for a productivity assistant.

Classify the user's message into exactly one of these intents:
- "focus": User wants priorities, focus items, urgent tasks, or a daily briefing
- "summarize": User wants a summary or analysis of their inbox
- "calendar": User wants to see meetings, events, or calendar info
- "email": User wants to see their emails or inbox
- "unknown": Message doesn't match any intent

Reply with ONLY the intent word, nothing else.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      });

      const intent = response.choices?.[0]?.message?.content?.trim().toLowerCase() ?? "unknown";

      if (VALID_INTENTS.includes(intent as AssistantIntent)) {
        return intent as AssistantIntent;
      }

      return "unknown";
    } catch (error) {
      logger.warn("Intent classification failed, falling back to keyword matching", {
        error: error instanceof Error ? error.message : "Unknown error",
      });

      return this.keywordFallback(message);
    }
  }

  private keywordFallback(message: string): AssistantIntent {
    const lower = message.toLowerCase();

    if (lower.includes("focus") || lower.includes("priority") || lower.includes("urgent") || lower.includes("today")) {
      return "focus";
    }
    if (lower.includes("summarize") || lower.includes("summary")) {
      return "summarize";
    }
    if (lower.includes("meeting") || lower.includes("calendar") || lower.includes("event")) {
      return "calendar";
    }
    if (lower.includes("email") || lower.includes("inbox")) {
      return "email";
    }

    return "unknown";
  }

  private getHelpMessage(): string {
    return `
I can help with:

• Show my emails
• Show my calendar
• Summarize my inbox
• What should I focus on today?
• Any urgent emails?
• What are my priorities today?
`;
  }

  private async getCalendarSummary(userId: string) {
    try {
      const events = await this.calendarService.getUpcomingEvents(userId);

      if (events.length === 0) {
        return "No upcoming events found.";
      }

      return events
        .map(
          (event) =>
            `• ${event.title}\n${new Date(event.start).toLocaleString()}`
        )
        .join("\n\n");
    } catch (error) {
      if (error instanceof IntegrationNotConnectedError) {
        return "Connect Google Calendar to view your events.";
      }

      throw error;
    }
  }

  private async getInboxSummary(userId: string) {
    try {
      const emails = await this.emailService.getEmails(userId);

      if (emails.length === 0) {
        return "No emails found.";
      }

      return emails
        .slice(0, 5)
        .map((email, index) => `${index + 1}. ${email.subject}`)
        .join("\n");
    } catch (error) {
      if (error instanceof IntegrationNotConnectedError) {
        return "Connect Gmail to view your inbox.";
      }

      throw error;
    }
  }

  async summarizeInbox(userId: string) {
    try {
      const emails = await this.emailService.getEmails(userId);

      if (emails.length === 0) {
        return "No emails found in your inbox.";
      }

      logger.info("Generating inbox summary", {
        userId,
        emailCount: emails.length,
      });

      const groq = getGroqClient();

      const emailContext = emails
        .slice(0, 20)
        .map(
          (email) =>
            `From: ${email.from}\nSubject: ${email.subject}\nSnippet: ${email.snippet}`
        )
        .join("\n");

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are an executive assistant.

Analyze the inbox and provide:

• Overview
• Important emails
• Action items
• Deadlines

Ignore marketing emails.

Maximum 150 words.
`,
          },
          {
            role: "user",
            content: emailContext,
          },
        ],
        temperature: 0.3,
      });

      return (
        response.choices?.[0]?.message?.content ?? "Unable to summarize inbox."
      );
    } catch (error) {
      if (error instanceof IntegrationNotConnectedError) {
        return "Connect Gmail to summarize your inbox.";
      }

      throw error;
    }
  }

  async getFocusToday(userId: string) {
    try {
      const emails = await this.emailService.getEmails(userId);
      const events = await this.calendarService.getUpcomingEvents(userId);

      logger.info("Generating focus briefing", {
        userId,
        emailCount: emails.length,
        eventCount: events.length,
      });

      const groq = getGroqClient();

      const emailContext = emails
        .slice(0, 10)
        .map(
          (email) =>
            `From: ${email.from}\nSubject: ${email.subject}\nSnippet: ${email.snippet}`
        )
        .join("\n");

      const eventContext = events
        .map((event) => `Event: ${event.title}\nStart: ${event.start}`)
        .join("\n");

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are an executive assistant.

Generate a clean daily briefing.

Rules:
- Maximum 5 bullets
- Start directly with bullets
- No introductions
- No headings
- No markdown formatting
- Focus on actionable tasks
- Mention meetings with times
- Ignore promotions and newsletters
`,
          },
          {
            role: "user",
            content: `
EMAILS

${emailContext}

EVENTS

${eventContext}
`,
          },
        ],
        temperature: 0.3,
      });

      return response.choices?.[0]?.message?.content ?? "No priorities found.";
    } catch (error) {
      if (error instanceof IntegrationNotConnectedError) {
        return "Connect Gmail and Google Calendar to get your daily focus briefing.";
      }

      throw error;
    }
  }
}
