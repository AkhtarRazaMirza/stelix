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

const INBOX_CACHE_TTL_MS = 30_000;
const MESSAGE_METADATA_CACHE_TTL_MS = 60_000;
const MAX_INBOX_CACHE_SIZE = 500;
const MAX_METADATA_CACHE_SIZE = 2_000;

const inboxCache = new Map<string, { data: InboxPage; fetchedAt: number }>();
export const messageMetadataCache = new Map<string, { data: GmailMessage; fetchedAt: number }>();
export const inFlightMessageGets = new Map<string, Promise<GmailMessage>>();

function pruneCache<T>(map: Map<string, { fetchedAt: number }>, ttlMs: number, maxSize: number) {
  const now = Date.now();
  for (const [key, entry] of map.entries()) {
    if (now - entry.fetchedAt >= ttlMs) {
      map.delete(key);
    }
  }
  if (map.size > maxSize) {
    const overflow = map.size - maxSize;
    let deleted = 0;
    for (const key of map.keys()) {
      map.delete(key);
      deleted++;
      if (deleted >= overflow) break;
    }
  }
}


export async function fetchMessageWithCache(
  gmailApi: any,
  id: string,
  metadataHeaders: string[] = ["From", "To", "Subject"]
): Promise<GmailMessage> {
  if (!id) {
    return { id: "" } as GmailMessage;
  }

  const cachedMeta = messageMetadataCache.get(id);
  if (cachedMeta && Date.now() - cachedMeta.fetchedAt < MESSAGE_METADATA_CACHE_TTL_MS) {
    return cachedMeta.data;
  }

  const inFlight = inFlightMessageGets.get(id);
  if (inFlight) {
    return inFlight;
  }

  const fetchPromise = (async () => {
    try {
      const res = (await gmailApi.messages.get({
        id,
        format: "metadata",
        metadataHeaders,
      })) as GmailMessage;
      if (res && res.id) {
        pruneCache(messageMetadataCache, MESSAGE_METADATA_CACHE_TTL_MS, MAX_METADATA_CACHE_SIZE);
        messageMetadataCache.set(res.id, { data: res, fetchedAt: Date.now() });
      }
      return res;
    } finally {
      inFlightMessageGets.delete(id);
    }
  })();

  inFlightMessageGets.set(id, fetchPromise);
  return fetchPromise;
}

export class GmailService {
  constructor(
    private readonly integrationGuard = new IntegrationGuard(),
    private readonly corsairService = new CorsairService()
  ) {}

  clearCache(userId: string) {
    for (const key of inboxCache.keys()) {
      if (key.startsWith(`${userId}:`)) {
        inboxCache.delete(key);
      }
    }
    const now = Date.now();
    for (const [id, entry] of messageMetadataCache.entries()) {
      if (now - entry.fetchedAt >= MESSAGE_METADATA_CACHE_TTL_MS) {
        messageMetadataCache.delete(id);
      }
    }
  }

  private resolveGmail(userId: string) {
    const tenant = this.corsairService.resolveTenant(userId);
    return tenant.gmail.api;
  }

  private async listByLabel(
    userId: string,
    label: GmailLabel,
    options: { pageToken?: string | undefined; query?: string | undefined } = {}
  ): Promise<InboxPage> {
    const cacheKey = `${userId}:${label}:${options.pageToken ?? ""}:${options.query ?? ""}`;
    const cached = inboxCache.get(cacheKey);
    if (cached && Date.now() - cached.fetchedAt < INBOX_CACHE_TTL_MS) {
      return cached.data;
    }

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
        const id = listMessage.id ?? "";
        const message = await fetchMessageWithCache(gmail, id, ["From", "To", "Subject"]);
        return mapSummary(message);
      })
    );

    const result: InboxPage = {
      emails,
      nextPageToken: response.nextPageToken ?? null,
      resultSizeEstimate: response.resultSizeEstimate ?? emails.length,
    };

    pruneCache(inboxCache, INBOX_CACHE_TTL_MS, MAX_INBOX_CACHE_SIZE);
    inboxCache.set(cacheKey, { data: result, fetchedAt: Date.now() });
    return result;
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
    this.clearCache(userId);

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
    this.clearCache(userId);

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
