import type { ChatCompletionTool } from "groq-sdk/resources/chat/completions";

/**
 * A single turn in the conversation, persisted in `ai_chats` and replayed
 * as lightweight context on the next request.
 */
export interface AgentMessage {
  role: "user" | "assistant";
  content: string;
}

/**
 * The category of a tool, used purely for UI grouping / iconography on the
 * client. The agent itself does not branch on this.
 */
export type AgentActionCategory = "email" | "calendar" | "search";

/**
 * The structured record of one executed tool call. This is what the UI uses
 * to render trustworthy "✓ Email sent to..." action cards, separate from the
 * model's natural-language reply.
 */
export interface AgentAction {
  tool: string;
  category: AgentActionCategory;
  /** Short human-readable label, e.g. "Email sent to john@example.com". */
  summary: string;
  status: "success" | "error";
  /** Safe, serialisable detail payload for the client (never raw errors). */
  detail?: Record<string, unknown>;
}

/**
 * The final response returned by the agent for one user message.
 */
export interface AgentResponse {
  response: string;
  actions: AgentAction[];
}

/**
 * Result of executing a single tool. `summary` + `category` feed the
 * AgentAction; `data` is fed back to the LLM so it can compose its reply
 * and decide on follow-up tool calls.
 */
export interface ToolExecutionResult {
  status: "success" | "error";
  category: AgentActionCategory;
  summary: string;
  /** Data passed back into the model context (must be JSON-serialisable). */
  data: Record<string, unknown>;
  /** Detail surfaced to the client UI. */
  detail?: Record<string, unknown>;
}

/**
 * A tool the agent can invoke. `schema` is the Groq/OpenAI function schema
 * advertised to the model; `execute` runs the real work against existing
 * services. `userId` is always injected by the service from the authenticated
 * request — it is never taken from model-generated arguments.
 */
export interface ToolDefinition {
  name: string;
  category: AgentActionCategory;
  schema: ChatCompletionTool;
  execute: (
    userId: string,
    args: Record<string, unknown>
  ) => Promise<ToolExecutionResult>;
}

/**
 * Lightweight, user- and session-scoped conversation context. Intentionally
 * minimal: a bounded slice of recent history plus the current message.
 */
export interface ConversationContext {
  userId: string;
  message: string;
  history: AgentMessage[];
}
