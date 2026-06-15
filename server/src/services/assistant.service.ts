import { EmailService } from "./email.service.js";
import { CalendarService } from "./calendar.service.js";

const emailService = new EmailService();
const calendarService = new CalendarService();

export class AssistantService {
  async handle(message: string) {
    const text = message.toLowerCase();

    if (text.includes("email")) {
      const emails =
        await emailService.getEmails();

      return `Found ${emails.length} emails`;
    }

    if (
      text.includes("event") ||
      text.includes("calendar")
    ) {
      const events =
        await calendarService.getEvents();

      return `Found ${events.length} calendar events`;
    }

    return "I can help with emails and calendar events.";
  }
}