import { apiFetch } from "./client";

export function getDashboard() {
  return apiFetch<{
    emailCount: number;
    meetingCount: number;
    integrationCount: number;
    aiSummary: string;
    recentEmails: {
      id: string;
      from: string;
      subject: string;
      snippet?: string;
      receivedAt?: string;
    }[];
    upcomingEvents: {
      id: string;
      title: string;
      start?: string;
      end?: string;
    }[];
  }>("/dashboard");
}