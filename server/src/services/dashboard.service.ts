import { EmailService } from "./email.service.js";
import { CalendarService } from "./calendar.service.js";
import { checkGROQAi } from "../config/ai.js";

const emailService = new EmailService();
const calendarService = new CalendarService();

export class DashboardService {
  async getDashboardData() {
    const emails =
      await emailService.getEmails();

    const events =
      await calendarService.getEvents();

    const aiSummary =
      await this.getAISummary();

    return {
      emailCount: emails.length,

      meetingCount: events.length,

      integrationCount: 2,

      aiSummary,

      recentEmails: emails.slice(0, 5),

      upcomingEvents: events.slice(0, 5),
    };
  }

  async getAISummary() {
    const emails =
      await emailService.getEmails();

    if (emails.length === 0) {
      return "No emails found.";
    }

    const groq =
      await checkGROQAi();

    const emailContext = emails
      .slice(0, 10)
      .map(
        (email: any) =>
          `
From: ${email.from}
Subject: ${email.subject}
Snippet: ${email.snippet}
`
      )
      .join("\n");

    const response =
      await groq.chat.completions.create({
        model:
          "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `
Create a short dashboard summary.

Use bullet points.

Maximum 4 bullets.

Focus on:
- Important emails
- Action items
- Meetings
`,
          },
          {
            role: "user",
            content: emailContext,
          },
        ],
      });

    return (
      response.choices?.[0]?.message
        ?.content ?? ""
    );
  }
}