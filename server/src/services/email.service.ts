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

export class EmailService {
  constructor(
    private readonly integrationGuard = new IntegrationGuard(),
    private readonly corsairService = new CorsairService()
  ) {}

  async getEmails(userId: string): Promise<MappedEmail[]> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    this.corsairService.logProviderOperation(userId, "gmail", "list_messages");

    const tenant = this.corsairService.resolveTenant(userId);
    const response = await tenant.gmail.api.messages.list({});

    const messages = response.messages ?? [];

    const emails = await Promise.all(
      messages.slice(0, 20).map(async (message: GmailListMessage) => {
        const email = await tenant.gmail.api.messages.get({
          id: message.id,
        });

        return mapEmail(email as GmailMessage);
      })
    );

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
    });

    const messages = response.messages ?? [];

    const emails = await Promise.all(
      messages.slice(0, 20).map(async (message: GmailListMessage) => {
        const email = await tenant.gmail.api.messages.get({
          id: message.id,
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
