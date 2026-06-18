export interface EmailSummary {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  isRead: boolean;
}

export interface EmailAttachment {
  attachmentId: string;
  filename: string;
  mimeType: string;
  size: number;
}

export interface EmailDetail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  htmlBody: string;
  receivedAt: string;
  isRead: boolean;
  attachments: EmailAttachment[];
}

export interface InboxPage {
  emails: EmailSummary[];
  nextPageToken: string | null;
  resultSizeEstimate: number;
}

export interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailResult {
  id: string;
  threadId: string;
}

export type MailView = "inbox" | "sent";
