import { checkGROQAi } from "../config/ai.js";
import { EmailService } from "./email.service.js";
import { CalendarService } from "./calendar.service.js";

const emailService = new EmailService();
const calendarService = new CalendarService();

export class AssistantService {
    async handle(message: string) {
        const groq = await checkGROQAi();

        const completion =
            await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `
You are an intent classifier.

Return only one word:

EMAILS
EVENTS
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
  completion.choices?.[0]?.message?.content?.trim() ??
  "UNKNOWN";

        if (intent === "EMAILS") {
            const emails =
                await emailService.getEmails();

            return emails
                .slice(0, 5)
                .map(
                    (email: any, index: number) =>
                        `${index + 1}. ${email.subject}`
                )
                .join("\n");
        }

        if (intent === "EVENTS") {
            const events =
                await calendarService.getEvents();

            return events
                .map(
                    (event: any) =>
                        `• ${event.title}`
                )
                .join("\n");
        }

        return `
I can help with:

• Show my emails
• Show my events
• Upcoming meetings
• Inbox summary
`;
    }
}