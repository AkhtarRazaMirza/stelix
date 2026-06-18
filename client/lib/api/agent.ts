import { apiFetch } from "./client";

export type AgentActionCategory = "email" | "calendar" | "search";

export interface AgentAction {
  tool: string;
  category: AgentActionCategory;
  summary: string;
  status: "success" | "error";
  detail?: Record<string, unknown>;
}

export interface AgentChatResponse {
  response: string;
  actions: AgentAction[];
}

export function sendAgentMessage(message: string) {
  return apiFetch<AgentChatResponse>("/agent/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
