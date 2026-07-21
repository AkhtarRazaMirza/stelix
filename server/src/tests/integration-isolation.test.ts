import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { inArray } from "drizzle-orm";

// The real AssistantService makes two distinct kinds of Groq calls:
//   1. intent classification — system prompt asks for a single intent word,
//      and the service only accepts one of its VALID_INTENTS in response;
//   2. content generation (inbox summary) — returns free-form prose.
// A single "Mock AI summary" stub breaks classification (that string is not a
// valid intent, so every message fell through to the help text). Mock by call
// shape: derive the intent from the user message for classification calls,
// return the summary text otherwise.
vi.mock("../config/ai.js", () => ({
  getGroqClient: vi.fn(() => ({
    chat: {
      completions: {
        create: vi.fn(async (params: any) => {
          const messages = params?.messages ?? [];
          const system = String(messages[0]?.content ?? "");
          const isClassification = system.includes("intent classifier");

          if (isClassification) {
            const userMessage = String(messages[1]?.content ?? "").toLowerCase();
            const intent = userMessage.includes("inbox") || userMessage.includes("email")
              ? "email"
              : "unknown";
            return { choices: [{ message: { content: intent } }] };
          }

          return { choices: [{ message: { content: "Mock AI summary" } }] };
        }),
      },
    },
  })),
}));

import { assertIntegrationOwnership } from "../authorization/integration.authorization.js";
import { ForbiddenError } from "../errors/app.errors.js";
import { IntegrationNotConnectedError } from "../errors/app.errors.js";
import type { Integration } from "../types/integration.types.js";
import { EmailService } from "../services/email.service.js";
import { CalendarService } from "../services/calendar.service.js";
import { DashboardService } from "../services/dashboard.service.js";
import { AssistantService } from "../services/assistant.service.js";
import { IntegrationGuard } from "../services/integration.guard.js";
import type { CorsairService } from "../services/corsair.service.js";
import type { IntegrationRepository } from "../repositories/integration.repository.js";
import { db } from "../config/db.js";
import { aiChatsTable, usersTable } from "../db/schema.js";

const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";

const integrationA: Integration = {
  id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  userId: USER_A,
  provider: "gmail",
  corsairAccountId: "account-a-gmail",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const integrationB: Integration = {
  id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
  userId: USER_B,
  provider: "gmail",
  corsairAccountId: "account-b-gmail",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const calendarIntegrationA: Integration = {
  id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
  userId: USER_A,
  provider: "googlecalendar",
  corsairAccountId: "account-a-calendar",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const calendarIntegrationB: Integration = {
  id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
  userId: USER_B,
  provider: "googlecalendar",
  corsairAccountId: "account-b-calendar",
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockRepository(): IntegrationRepository {
  return {
    getByUserId: vi.fn(async (userId: string) => {
      if (userId === USER_A) {
        return [integrationA, calendarIntegrationA];
      }

      if (userId === USER_B) {
        return [integrationB, calendarIntegrationB];
      }

      return [];
    }),
    getByProvider: vi.fn(async (userId: string, provider: Integration["provider"]) => {
      const integrations = {
        [USER_A]: {
          gmail: integrationA,
          googlecalendar: calendarIntegrationA,
        },
        [USER_B]: {
          gmail: integrationB,
          googlecalendar: calendarIntegrationB,
        },
      } as const;

      return integrations[userId as keyof typeof integrations]?.[provider] ?? null;
    }),
    getUserIntegration: vi.fn(async (userId: string, integrationId: string) => {
      const all = [integrationA, integrationB, calendarIntegrationA, calendarIntegrationB];
      return all.find(
        (integration) =>
          integration.id === integrationId && integration.userId === userId
      ) ?? null;
    }),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  } as unknown as IntegrationRepository;
}

function createMockCorsairService(): CorsairService {
  return {
    resolveTenant: vi.fn((userId: string) => ({
      gmail: {
        api: {
          messages: {
            list: vi.fn(async () => ({
              messages: [{ id: `${userId}-message-1` }],
            })),
            get: vi.fn(async ({ id }: { id: string }) => ({
              id,
              snippet: `Snippet for ${userId}`,
              internalDate: String(Date.now()),
              payload: {
                headers: [
                  { name: "From", value: `${userId}@example.com` },
                  { name: "Subject", value: `Inbox for ${userId}` },
                ],
              },
            })),
          },
        },
      },
      googlecalendar: {
        api: {
          events: {
            getMany: vi.fn(async () => ({
              items: [
                {
                  id: `${userId}-event-1`,
                  summary: `Event for ${userId}`,
                  start: {
                    dateTime: new Date(Date.now() + 60_000).toISOString(),
                  },
                  end: {
                    dateTime: new Date(Date.now() + 120_000).toISOString(),
                  },
                  status: "confirmed",
                  htmlLink: `https://calendar.example/${userId}`,
                },
              ],
            })),
          },
        },
      },
    })),
    logProviderOperation: vi.fn(),
  } as unknown as CorsairService;
}

describe("multi-user data isolation", () => {
  const repository = createMockRepository();
  const corsairService = createMockCorsairService();
  const integrationGuard = new IntegrationGuard(repository);

  const emailService = new EmailService(integrationGuard, corsairService);
  const calendarService = new CalendarService(integrationGuard, corsairService);
  const dashboardService = new DashboardService(
    emailService,
    calendarService,
    repository
  );
  const assistantService = new AssistantService(emailService, calendarService);

  // AssistantService.handle persists chat rows to ai_chats, whose user_id has a
  // FK to users. Seed the two test users (and clean up after) so the persisted
  // rows satisfy the constraint. Everything else in this suite is mocked; only
  // the assistant chat-persistence path touches the real database.
  const TEST_USER_IDS = [USER_A, USER_B];

  beforeAll(async () => {
    await db
      .insert(usersTable)
      .values([
        { id: USER_A, fullName: "User A", email: "user-a@example.test" },
        { id: USER_B, fullName: "User B", email: "user-b@example.test" },
      ])
      .onConflictDoNothing();
  });

  afterAll(async () => {
    // ai_chats rows are removed via ON DELETE CASCADE when the users are deleted.
    await db.delete(usersTable).where(inArray(usersTable.id, TEST_USER_IDS));
  });

  it("returns Gmail A for user A and Gmail B for user B", async () => {
    const emailsA = await emailService.getEmails(USER_A);
    const emailsB = await emailService.getEmails(USER_B);

    expect(emailsA[0]?.subject).toBe(`Inbox for ${USER_A}`);
    expect(emailsB[0]?.subject).toBe(`Inbox for ${USER_B}`);
    expect(emailsA[0]?.subject).not.toBe(emailsB[0]?.subject);
  });

  it("scopes dashboard data per user", async () => {
    const dashboardA = await dashboardService.getDashboardData(USER_A);
    const dashboardB = await dashboardService.getDashboardData(USER_B);

    expect(dashboardA.recentEmails[0]?.subject).toContain(USER_A);
    expect(dashboardB.recentEmails[0]?.subject).toContain(USER_B);
    expect(dashboardA.integrationCount).toBe(2);
    expect(dashboardB.integrationCount).toBe(2);
  });

  it("scopes assistant inbox summaries per user", async () => {
    const inboxA = await assistantService.handle(USER_A, "show my inbox");
    const inboxB = await assistantService.handle(USER_B, "show my inbox");

    expect(inboxA).toContain(`Inbox for ${USER_A}`);
    expect(inboxB).toContain(`Inbox for ${USER_B}`);
    expect(inboxA).not.toContain(`Inbox for ${USER_B}`);
    expect(inboxB).not.toContain(`Inbox for ${USER_A}`);
  });

  it("scopes assistant summarize inbox per user", async () => {
    const summaryA = await assistantService.summarizeInbox(USER_A);
    const summaryB = await assistantService.summarizeInbox(USER_B);

    expect(summaryA).toBe("Mock AI summary");
    expect(summaryB).toBe("Mock AI summary");
    expect(corsairService.resolveTenant).toHaveBeenCalledWith(USER_A);
    expect(corsairService.resolveTenant).toHaveBeenCalledWith(USER_B);
  });

  it("scopes calendar events per user", async () => {
    const eventsA = await calendarService.getEvents(USER_A);
    const eventsB = await calendarService.getEvents(USER_B);

    expect(eventsA[0]?.title).toBe(`Event for ${USER_A}`);
    expect(eventsB[0]?.title).toBe(`Event for ${USER_B}`);
  });

  it("prevents cross-user integration ownership", async () => {
    await expect(
      assertIntegrationOwnership(USER_B, integrationA.id, repository)
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("requires integration before Gmail access", async () => {
    const guard = new IntegrationGuard({
      getByProvider: vi.fn(async () => null),
    } as unknown as IntegrationRepository);

    const service = new EmailService(guard, corsairService);

    await expect(service.getEmails(USER_A)).rejects.toBeInstanceOf(
      IntegrationNotConnectedError
    );
  });

  it("never calls Corsair without resolving tenant for userId", async () => {
    await emailService.getEmails(USER_A);
    await emailService.getEmails(USER_B);

    expect(corsairService.resolveTenant).toHaveBeenCalledWith(USER_A);
    expect(corsairService.resolveTenant).toHaveBeenCalledWith(USER_B);
  });
});
