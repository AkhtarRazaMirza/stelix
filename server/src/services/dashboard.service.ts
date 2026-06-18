import { getGroqClient } from "../config/ai.js";
import { logger } from "../config/logger.js";
import { IntegrationRepository } from "../repositories/integration.repository.js";
import { EmailService, type MappedEmail } from "./email.service.js";
import { CalendarService } from "./calendar.service.js";

export class DashboardService {
  constructor(
    private readonly emailService = new EmailService(),
    private readonly calendarService = new CalendarService(),
    private readonly integrationRepository = new IntegrationRepository()
  ) { }

  async getDashboardData(userId: string) {
    logger.info("Building dashboard data", { userId });

    const integrations =
      await this.integrationRepository.getByUserId(userId);

    const hasGmail = integrations.some(
      (integration) => integration.provider === "gmail"
    );
    const hasCalendar = integrations.some(
      (integration) => integration.provider === "googlecalendar"
    );

    const emails = hasGmail
      ? await this.emailService.getEmails(userId)
      : [];

    const events = hasCalendar
      ? await this.calendarService.getUpcomingEvents(userId)
      : [];

    const aiSummary = hasGmail
      ? await this.getAISummary(userId, emails)
      : "Connect Gmail to receive AI summaries.";

    return {
      emailCount: emails.length,
      meetingCount: events.length,
      integrationCount: integrations.length,
      aiSummary,
      recentEmails: emails.slice(0, 5),
      upcomingEvents: events.slice(0, 5),
    };
  }

  private async getAISummary(userId: string, emails: MappedEmail[]) {
    if (emails.length === 0) {
      return "No emails found.";
    }

    logger.info("Generating dashboard AI summary", {
      userId,
      emailCount: emails.length,
    });

    const groq = getGroqClient();

    const emailContext = emails
      .slice(0, 10)
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
You are an executive assistant creating a dashboard briefing.

Rules:
- Return only bullet points
- Maximum 3 bullet points
- Maximum 12 words per bullet
- Focus on urgent emails
- Focus on action items
- Focus on meetings or deadlines
- Ignore promotions
- Ignore newsletters
- Ignore marketing emails
`,
        },
        {
          role: "user",
          content: emailContext,
        },
      ],
    });

    return response.choices?.[0]?.message?.content ?? "";
  }
}
