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

    const dashboardStart = Date.now();

    const integrationsStart = Date.now();
    const integrations =
      await this.integrationRepository.getByUserId(userId);
    logger.info("[perf] integrations query", {
      userId,
      ms: Date.now() - integrationsStart,
    });

    const hasGmail = integrations.some(
      (integration) => integration.provider === "gmail"
    );
    const hasCalendar = integrations.some(
      (integration) => integration.provider === "googlecalendar"
    );

    const fetchEmails = async (): Promise<MappedEmail[]> => {
      if (!hasGmail) return [];
      const emailsStart = Date.now();
      const res = await this.emailService.getEmails(userId);
      logger.info("[perf] email fetch", {
        userId,
        ms: Date.now() - emailsStart,
        emailCount: res.length,
      });
      return res;
    };

    const fetchEvents = async () => {
      if (!hasCalendar) return [];
      const eventsStart = Date.now();
      const res = await this.calendarService.getUpcomingEvents(userId);
      logger.info("[perf] calendar fetch", {
        userId,
        ms: Date.now() - eventsStart,
        eventCount: res.length,
      });
      return res;
    };

    const [emails, events] = await Promise.all([
      fetchEmails(),
      fetchEvents(),
    ]);

    const aiSummaryStart = Date.now();
    const aiSummary = hasGmail
      ? await this.getAISummary(userId, emails)
      : "Connect Gmail to receive AI summaries.";
    logger.info("[perf] ai summary generation", {
      userId,
      ms: Date.now() - aiSummaryStart,
    });

    logger.info("[perf] dashboard total", {
      userId,
      ms: Date.now() - dashboardStart,
    });

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
