import { checkGROQAi } from "../config/ai.js";
import { EmailService } from "./email.service.js";
import { CalendarService } from "./calendar.service.js";

const emailService = new EmailService();
const calendarService = new CalendarService();

export class AssistantService {
  async handle(message: string) {
    const groq = await checkGROQAi();

    // Intent Classification
    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
You are an intent classifier.

Return only one word.

EMAILS:
- show my emails
- latest emails
- inbox
- unread emails

EVENTS:
- meetings
- calendar
- today's events
- upcoming meetings

SUMMARIZE_EMAILS:
- summarize my inbox
- summarize emails
- inbox summary
- what is important in my inbox

UNKNOWN:
- anything else

Return only:
EMAILS
EVENTS
SUMMARIZE_EMAILS
UNKNOWN
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0,
      });

    const intent =
      completion.choices?.[0]?.message?.content
        ?.trim()
        .toUpperCase() ?? "UNKNOWN";

    // Show Emails
    if (intent === "EMAILS") {
      const emails =
        await emailService.getEmails();

      if (emails.length === 0) {
        return "No emails found.";
      }

      return emails
        .slice(0, 5)
        .map(
          (email: any, index: number) =>
            `${index + 1}. ${email.subject}`
        )
        .join("\n");
    }

    // Summarize Inbox
    if (intent === "SUMMARIZE_EMAILS") {
      const emails =
        await emailService.getEmails();

      if (emails.length === 0) {
        return "No emails found in your inbox.";
      }

      const emailContext = emails
        .slice(0, 20)
        .map(
          (email: any) => `
From: ${email.from}
Subject: ${email.subject}
Snippet: ${email.snippet}
`
        )
        .join("\n");

      const summary =
        await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `
You are an executive assistant.

Analyze the inbox and provide:

1. Short overview
2. Important emails
3. Action items
4. Meetings or deadlines

Ignore:
- Promotions
- Newsletters
- Marketing emails

Use bullet points.

Keep the response under 150 words.
`,
            },
            {
              role: "user",
              content: `
Total Emails: ${emails.length}

${emailContext}
`,
            },
          ],
          temperature: 0.3,
        });

      return (
        summary.choices?.[0]?.message
          ?.content ??
        "Unable to summarize inbox."
      );
    }

    // Show Calendar Events
    if (intent === "EVENTS") {
      const events =
        await calendarService.getEvents();

      if (events.length === 0) {
        return "No upcoming events found.";
      }

      return events
        .map(
          (event: any) =>
            `• ${event.title}`
        )
        .join("\n");
    }

    // Fallback
    return `
I can help with:

• Show my emails
• Show my events
• Upcoming meetings
• Summarize my inbox
`;
  }
}