import { apiFetch } from "./client";

export function getEmails() {
  return apiFetch<{
    emails: {
      id: string;
      from: string;
      subject: string;
      snippet: string;
      receivedAt: string;
    }[];
  }>("/emails");
}