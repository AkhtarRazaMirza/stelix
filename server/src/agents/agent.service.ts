import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "groq-sdk/resources/chat/completions";

import { getGroqClient } from "../config/ai.js";
import { logger } from "../config/logger.js";
import { db } from "../config/db.js";
import { aiChatsTable } from "../db/schema.js";
import { eq, desc } from "drizzle-orm";

import { AppError, IntegrationNotConnectedError } from "../errors/app.errors.js";
import { GmailService } from "../services/gmail.service.js";
import { CalendarService } from "../services/calendar.service.js";

import { createGmailTools } from "./tools/gmail.tool.js";
import { createCalendarTools } from "./tools/calendar.tool.js";
import { createSearchTool } from "./tools/search.tool.js";
import { ToolArgumentError } from "./tools/tool-helpers.js";

import type {
  AgentAction,
  AgentMessage,
  AgentResponse,
  ToolDefinition,
} from "./agent.types.js";

const MODEL = "llama-3.3-70b-versatile";
/** Max LLM round-trips per request — bounds latency and cost for multi-step. */
const MAX_ITERATIONS = 5;
/** How many prior turns to replay as lightweight conversation context. */
const HISTORY_LIMIT = 6;

function systemPrompt(): string {
  const now = new Date();
  return `You are Stelix, an AI command center that manages the user's Gmail and Google Calendar through tools.

Current date and time: ${now.toISOString()} (${now.toLocaleString()}).

Guidelines:
- Understand the user's intent and use the provided tools to actually perform actions. Do not claim an action is done unless a tool confirmed it.
- For multi-step requests (e.g. "schedule a meeting with John and email him"), call the necessary tools in sequence.
- Resolve relative dates ("tomorrow", "next Thursday at 3pm") into absolute ISO 8601 date-times using the current date above before calling calendar tools.
- When scheduling with attendees, include their email addresses so invitations are sent.
- If a required detail is genuinely missing (e.g. no recipient for an email), ask the user a brief clarifying question instead of guessing.
- Keep final replies concise, friendly, and confirm what was done. Do not invent data that no tool returned.`;
}

export class AgentService {
  private readonly tools: ToolDefinition[];
  private readonly toolMap: Map<string, ToolDefinition>;
  private readonly toolSchemas: ChatCompletionTool[];

  constructor(
    gmailService: GmailService = new GmailService(),
    calendarService: CalendarService = new CalendarService()
  ) {
    this.tools = [
      ...createGmailTools(gmailService),
      ...createCalendarTools(calendarService),
      createSearchTool(gmailService, calendarService),
    ];
    this.toolMap = new Map(this.tools.map((tool) => [tool.name, tool]));
    this.toolSchemas = this.tools.map((tool) => tool.schema);
  }

  async chat(userId: string, message: string): Promise<AgentResponse> {
    logger.info("Agent request received", {
      userId,
      messageLength: message.length,
    });

    // Load prior turns BEFORE persisting the current message so it is not
    // duplicated in the context window.
    const history = await this.loadHistory(userId);

    await this.persist(userId, "user", message);

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt() },
      ...history.map(
        (entry): ChatCompletionMessageParam => ({
          role: entry.role,
          content: entry.content,
        })
      ),
      { role: "user", content: message },
    ];

    const actions: AgentAction[] = [];

    let response: string;
    try {
      response = await this.runLoop(userId, messages, actions);
    } catch (error) {
      response = this.formatError(error, userId);
    }

    await this.persist(userId, "assistant", response);

    logger.info("Agent request completed", {
      userId,
      actionCount: actions.length,
    });

    return { response, actions };
  }

  /**
   * The agentic loop: ask the model, run any tools it requests, feed the
   * results back, and repeat until the model produces a final text answer
   * or the iteration budget is exhausted.
   */
  private async runLoop(
    userId: string,
    messages: ChatCompletionMessageParam[],
    actions: AgentAction[]
  ): Promise<string> {
    const groq = getGroqClient();

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration += 1) {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        messages,
        tools: this.toolSchemas,
        tool_choice: "auto",
        temperature: 0.2,
      });

      const choice = completion.choices?.[0]?.message;
      if (!choice) {
        return "I couldn't generate a response. Please try again.";
      }

      const toolCalls = choice.tool_calls ?? [];

      if (toolCalls.length === 0) {
        return (
          choice.content?.trim() ||
          "Done. Let me know if there's anything else."
        );
      }

      // Record the assistant's tool-call turn before appending tool results.
      messages.push({
        role: "assistant",
        content: choice.content ?? "",
        tool_calls: toolCalls,
      });

      // Execute the requested tools in parallel — they are independent
      // within a single model turn.
      const results = await Promise.all(
        toolCalls.map((call) => this.executeToolCall(userId, call, actions))
      );

      for (const result of results) {
        messages.push({
          role: "tool",
          tool_call_id: result.toolCallId,
          content: result.content,
        });
      }
    }

    // Iteration budget exhausted — ask the model for a final summary with
    // no further tool calls so the user still gets a coherent reply.
    const finalCompletion = await groq.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.2,
    });

    return (
      finalCompletion.choices?.[0]?.message?.content?.trim() ||
      "I completed the available steps. Let me know if you'd like to continue."
    );
  }

  private async executeToolCall(
    userId: string,
    call: { id: string; function: { name: string; arguments: string } },
    actions: AgentAction[]
  ): Promise<{ toolCallId: string; content: string }> {
    const toolName = call.function.name;
    const tool = this.toolMap.get(toolName);

    if (!tool) {
      logger.warn("Agent requested unknown tool", { userId, toolName });
      return {
        toolCallId: call.id,
        content: JSON.stringify({
          status: "error",
          error: `Unknown tool "${toolName}".`,
        }),
      };
    }

    let args: Record<string, unknown>;
    try {
      args = this.parseArguments(call.function.arguments);
    } catch {
      return {
        toolCallId: call.id,
        content: JSON.stringify({
          status: "error",
          error: "Tool arguments were not valid JSON.",
        }),
      };
    }

    try {
      logger.info("Agent executing tool", { userId, toolName });

      // userId is injected from the authenticated request — never from the
      // model's arguments — so tools can only ever act on the caller's data.
      const result = await tool.execute(userId, args);

      actions.push({
        tool: toolName,
        category: result.category,
        summary: result.summary,
        status: result.status,
        ...(result.detail ? { detail: result.detail } : {}),
      });

      return {
        toolCallId: call.id,
        content: JSON.stringify({ status: result.status, ...result.data }),
      };
    } catch (error) {
      const message = this.toolErrorMessage(error);

      logger.warn("Agent tool execution failed", {
        userId,
        toolName,
        error: message,
      });

      actions.push({
        tool: toolName,
        category: tool.category,
        summary: message,
        status: "error",
      });

      // Feed the failure back to the model so it can recover or explain.
      return {
        toolCallId: call.id,
        content: JSON.stringify({ status: "error", error: message }),
      };
    }
  }

  private parseArguments(raw: string): Record<string, unknown> {
    if (!raw || raw.trim().length === 0) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      throw new Error("Arguments must be a JSON object.");
    }
    return parsed as Record<string, unknown>;
  }

  /**
   * Maps a tool failure to a safe, user-facing message. Argument and
   * integration errors are actionable; everything else is generic so we
   * never leak internal details.
   */
  private toolErrorMessage(error: unknown): string {
    if (error instanceof ToolArgumentError) {
      return error.message;
    }
    if (error instanceof IntegrationNotConnectedError) {
      return error.message;
    }
    if (error instanceof AppError) {
      return error.message;
    }
    return "That action could not be completed. Please try again.";
  }

  private formatError(error: unknown, userId: string): string {
    if (error instanceof IntegrationNotConnectedError) {
      return error.message;
    }

    logger.error("Agent request failed", {
      userId,
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return "Something went wrong while processing your request. Please try again.";
  }

  private async loadHistory(userId: string): Promise<AgentMessage[]> {
    const rows = await db
      .select({
        role: aiChatsTable.role,
        message: aiChatsTable.message,
      })
      .from(aiChatsTable)
      .where(eq(aiChatsTable.userId, userId))
      .orderBy(desc(aiChatsTable.createdAt))
      .limit(HISTORY_LIMIT);

    // Rows are newest-first; replay oldest-first for the model context.
    return rows
      .reverse()
      .filter((row) => row.role === "user" || row.role === "assistant")
      .map((row) => ({
        role: row.role === "assistant" ? "assistant" : "user",
        content: row.message,
      }));
  }

  private async persist(
    userId: string,
    role: "user" | "assistant",
    message: string
  ): Promise<void> {
    await db.insert(aiChatsTable).values({ userId, role, message });
  }
}
