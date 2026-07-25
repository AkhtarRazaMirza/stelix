import { apiFetch } from "./client";
import { invalidateCommandCenterCache } from "./command-center-cache";
import type {
  EmailDetail,
  InboxPage,
  SendEmailInput,
  SendEmailResult,
} from "@/types/gmail";

export function getInbox(pageToken?: string) {
  const query = pageToken
    ? `?pageToken=${encodeURIComponent(pageToken)}`
    : "";

  return apiFetch<InboxPage>(`/gmail/inbox${query}`);
}

export function getSentEmails(pageToken?: string) {
  const query = pageToken
    ? `?pageToken=${encodeURIComponent(pageToken)}`
    : "";

  return apiFetch<InboxPage>(`/gmail/sent${query}`);
}

export function searchEmails(query: string) {
  return apiFetch<InboxPage>(
    `/gmail/search?q=${encodeURIComponent(query)}`
  );
}

export function getEmail(emailId: string) {
  return apiFetch<{ email: EmailDetail }>(
    `/gmail/emails/${encodeURIComponent(emailId)}`
  );
}

export function sendEmail(input: SendEmailInput) {
  invalidateCommandCenterCache(["inbox-preview", "sent-preview", "dashboard-metrics"]);
  return apiFetch<SendEmailResult>("/gmail/send", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function refreshInbox() {
  invalidateCommandCenterCache(["inbox-preview", "sent-preview", "dashboard-metrics"]);
  return apiFetch<InboxPage>("/gmail/refresh", {
    method: "POST",
  });
}
