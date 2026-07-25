import { CorsairService } from "./corsair.service.js";
import { IntegrationGuard } from "./integration.guard.js";

type GmailHeader = {
  name: string;
  value?: string;
};

type GmailMessage = {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: GmailHeader[];
  };
};

function getHeader(headers: GmailHeader[] | undefined, name: string) {
  return headers?.find((header) => header.name === name)?.value ?? "";
}

function mapEmail(message: GmailMessage) {
  return {
    id: message.id,
    from: getHeader(message.payload?.headers, "From"),
    subject: getHeader(message.payload?.headers, "Subject"),
    snippet: message.snippet ?? "",
    receivedAt: new Date(Number(message.internalDate ?? Date.now())),
  };
}

export type MappedEmail = ReturnType<typeof mapEmail>;

type GmailListMessage = {
  id: string;
};

const EMAIL_CACHE_TTL_MS = 15_000;
const emailCache = new Map<string, { emails: MappedEmail[]; fetchedAt: number }>();

export class EmailService {
  constructor(
    private readonly integrationGuard = new IntegrationGuard(),
    private readonly corsairService = new CorsairService()
  ) {}

  clearCache(userId: string) {
    emailCache.delete(userId);
  }

  async getEmails(userId: string): Promise<MappedEmail[]> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    const cached = emailCache.get(userId);
    if (cached && Date.now() - cached.fetchedAt < EMAIL_CACHE_TTL_MS) {
      return cached.emails;
    }

    this.corsairService.logProviderOperation(userId, "gmail", "list_messages");

    const tenant = this.corsairService.resolveTenant(userId);
    const response = await tenant.gmail.api.messages.list({ maxResults: 10 });

    const messages = response.messages ?? [];

    const emails = await Promise.all(
      messages.slice(0, 10).map(async (message: GmailListMessage) => {
        const email = await tenant.gmail.api.messages.get({
          id: message.id,
          format: "metadata",
          metadataHeaders: ["From", "Subject"],
        });

        return mapEmail(email as GmailMessage);
      })
    );

    emailCache.set(userId, { emails, fetchedAt: Date.now() });
    return emails;
  }

  async searchEmails(userId: string, query: string): Promise<MappedEmail[]> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    this.corsairService.logProviderOperation(userId, "gmail", "search_messages", {
      queryLength: query.length,
    });

    const tenant = this.corsairService.resolveTenant(userId);
    const response = await tenant.gmail.api.messages.list({
      q: query,
      maxResults: 10,
    });

    const messages = response.messages ?? [];

    const emails = await Promise.all(
      messages.slice(0, 10).map(async (message: GmailListMessage) => {
        const email = await tenant.gmail.api.messages.get({
          id: message.id,
          format: "metadata",
          metadataHeaders: ["From", "Subject"],
        });

        return mapEmail(email as GmailMessage);
      })
    );

    return emails;
  }

  async getEmailById(userId: string, emailId: string): Promise<MappedEmail> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    this.corsairService.logProviderOperation(userId, "gmail", "get_message", {
      emailId,
    });

    const tenant = this.corsairService.resolveTenant(userId);
    const email = await tenant.gmail.api.messages.get({
      id: emailId,
    });

    return mapEmail(email as GmailMessage);
  }
}
