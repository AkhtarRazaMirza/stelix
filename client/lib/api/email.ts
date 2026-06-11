import { apiFetch } from "./client";

export function getEmails() {
  return apiFetch("/emails");
}

export function getEmail(id: string) {
  return apiFetch(`/emails/${id}`);
}

export function sendEmail(data: {
  to: string;
  subject: string;
  body: string;
}) {
  return apiFetch("/emails/send", {
    method: "POST",
    body: JSON.stringify(data),
  });
}