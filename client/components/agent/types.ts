import type { AgentAction } from "@/lib/api/agent";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  actions?: AgentAction[];
  error?: boolean;
}
