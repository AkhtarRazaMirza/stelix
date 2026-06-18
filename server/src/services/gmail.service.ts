import { CorsairService } from "./corsair.service.js";
import { IntegrationGuard } from "./integration.guard.js";
import { NotFoundError } from "../errors/app.errors.js";
import type {
  EmailAttachment,
  EmailDetail,
  EmailSummary,
  GmailLabel,
  InboxPage,
  SendEmailInput,
  SendEmailResult,
} from "../types/gmail.types.js";

type GmailHeader = {
  name?: string;
  value?: string;
};

type GmailMessagePart = {
  partId?: string;
  mimeType?: string;
  filename?: string;
  headers?: GmailHeader[];
  body?: {
    attachmentId?: string;
    size?: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
};

type GmailMessage = {
  id?: string;
  threadId?: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: GmailMessagePart;
};

type GmailListMessage = {
  id?: string;
};

type GmailListResponse = {
  messages?: GmailListMessage[];
  nextPageToken?: string;
  resultSizeEstimate?: number;
};

const DEFAULT_PAGE_SIZE = 25;

function getHeader(headers: GmailHeader[] | undefined, name: string): string {
  return (
    headers?.find(
      (header) => header.name?.toLowerCase() === name.toLowerCase()
    )?.value ?? ""
  );
}

function decodeBase64Url(data: string): string {
  const normalized = data.replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(normalized, "base64").toString("utf-8");
}

function isRead(labelIds: string[] | undefined): boolean {
  return !(labelIds ?? []).includes("UNREAD");
}

function mapSummary(message: GmailMessage): EmailSummary {
  return {
    id: message.id ?? "",
    threadId: message.threadId ?? "",
    from: getHeader(message.payload?.headers, "From"),
    to: getHeader(message.payload?.headers, "To"),
    subject: getHeader(message.payload?.headers, "Subject"),
    snippet: message.snippet ?? "",
    receivedAt: new Date(Number(message.internalDate ?? Date.now())).toISOString(),
    isRead: isRead(message.labelIds),
  };
}

function collectBodies(
  part: GmailMessagePart | undefined,
  bodies: { text: string; html: string }
): void {
  if (!part) {
    return;
  }

  const data = part.body?.data;

  if (data && part.mimeType === "text/plain" && !part.filename) {
    bodies.text += decodeBase64Url(data);
  } else if (data && part.mimeType === "text/html" && !part.filename) {
    bodies.html += decodeBase64Url(data);
  }

  for (const child of part.parts ?? []) {
    collectBodies(child, bodies);
  }
}

function collectAttachments(
  part: GmailMessagePart | undefined,
  attachments: EmailAttachment[]
): void {
  if (!part) {
    return;
  }

  if (part.filename && part.body?.attachmentId) {
    attachments.push({
      attachmentId: part.body.attachmentId,
      filename: part.filename,
      mimeType: part.mimeType ?? "application/octet-stream",
      size: part.body.size ?? 0,
    });
  }

  for (const child of part.parts ?? []) {
    collectAttachments(child, attachments);
  }
}

function mapDetail(message: GmailMessage): EmailDetail {
  const bodies = { text: "", html: "" };
  collectBodies(message.payload, bodies);

  const attachments: EmailAttachment[] = [];
  collectAttachments(message.payload, attachments);

  return {
    id: message.id ?? "",
    threadId: message.threadId ?? "",
    from: getHeader(message.payload?.headers, "From"),
    to: getHeader(message.payload?.headers, "To"),
    subject: getHeader(message.payload?.headers, "Subject"),
    body: bodies.text,
    htmlBody: bodies.html,
    receivedAt: new Date(Number(message.internalDate ?? Date.now())).toISOString(),
    isRead: isRead(message.labelIds),
    attachments,
  };
}

function buildRawMessage(input: SendEmailInput): string {
  const headers = [
    `To: ${input.to}`,
    `Subject: ${input.subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
    "Content-Transfer-Encoding: 7bit",
  ];

  const message = `${headers.join("\r\n")}\r\n\r\n${input.body}`;

  return Buffer.from(message, "utf-8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export class GmailService {
  constructor(
    private readonly integrationGuard = new IntegrationGuard(),
    private readonly corsairService = new CorsairService()
  ) {}

  private resolveGmail(userId: string) {
    const tenant = this.corsairService.resolveTenant(userId);
    return tenant.gmail.api;
  }

  private async listByLabel(
    userId: string,
    label: GmailLabel,
    options: { pageToken?: string | undefined; query?: string | undefined } = {}
  ): Promise<InboxPage> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    const gmail = this.resolveGmail(userId);

    const response = (await gmail.messages.list({
      labelIds: [label],
      maxResults: DEFAULT_PAGE_SIZE,
      pageToken: options.pageToken,
      q: options.query,
    })) as GmailListResponse;

    const listMessages = response.messages ?? [];

    const emails = await Promise.all(
      listMessages.map(async (listMessage) => {
        const message = (await gmail.messages.get({
          id: listMessage.id ?? "",
          format: "metadata",
          metadataHeaders: ["From", "To", "Subject"],
        })) as GmailMessage;

        return mapSummary(message);
      })
    );

    return {
      emails,
      nextPageToken: response.nextPageToken ?? null,
      resultSizeEstimate: response.resultSizeEstimate ?? emails.length,
    };
  }

  async getInbox(userId: string, pageToken?: string): Promise<InboxPage> {
    this.corsairService.logProviderOperation(userId, "gmail", "inbox_list", {
      pageToken: pageToken ?? null,
    });

    return this.listByLabel(userId, "INBOX", { pageToken });
  }

  async getSentEmails(userId: string, pageToken?: string): Promise<InboxPage> {
    this.corsairService.logProviderOperation(userId, "gmail", "sent_list", {
      pageToken: pageToken ?? null,
    });

    return this.listByLabel(userId, "SENT", { pageToken });
  }

  async searchEmails(userId: string, query: string): Promise<InboxPage> {
    this.corsairService.logProviderOperation(userId, "gmail", "search", {
      queryLength: query.length,
    });

    return this.listByLabel(userId, "INBOX", { query });
  }

  async refreshInbox(userId: string): Promise<InboxPage> {
    this.corsairService.logProviderOperation(userId, "gmail", "inbox_refresh");

    return this.listByLabel(userId, "INBOX", {});
  }

  async getEmail(userId: string, emailId: string): Promise<EmailDetail> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    this.corsairService.logProviderOperation(userId, "gmail", "get_email", {
      emailId,
    });

    const gmail = this.resolveGmail(userId);

    const message = (await gmail.messages.get({
      id: emailId,
      format: "full",
    })) as GmailMessage;

    if (!message.id) {
      throw new NotFoundError("Email not found");
    }

    return mapDetail(message);
  }

  async sendEmail(
    userId: string,
    input: SendEmailInput
  ): Promise<SendEmailResult> {
    await this.integrationGuard.requireIntegration(userId, "gmail");

    this.corsairService.logProviderOperation(userId, "gmail", "send_email", {
      subjectLength: input.subject.length,
    });

    const gmail = this.resolveGmail(userId);

    const response = (await gmail.messages.send({
      raw: buildRawMessage(input),
    })) as GmailMessage;

    return {
      id: response.id ?? "",
      threadId: response.threadId ?? "",
    };
  }
}
