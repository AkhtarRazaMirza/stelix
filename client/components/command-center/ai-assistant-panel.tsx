"use client";

import { useCallback } from "react";
import { Sparkles, RotateCcw } from "lucide-react";

import { useAgentChat } from "@/hooks/use-agent-chat";
import { MessageList } from "@/components/agent/message-list";
import { MessageInput } from "@/components/agent/message-input";

const EXAMPLE_PROMPTS = [
  "Send an email to John",
  "Schedule a meeting tomorrow at 3 PM",
  "Find emails from Sarah",
];

interface AiAssistantPanelProps {
  /**
   * Called after the agent finishes a turn that performed at least one
   * successful action, so the dashboard can refresh affected widgets
   * (e.g. a newly sent email or created event).
   */
  onActionsCompleted?: () => void;
}

export function AiAssistantPanel({
  onActionsCompleted,
}: AiAssistantPanelProps) {
  const { messages, loading, send, reset } = useAgentChat();
  const active = messages.length > 0;

  const handleSend = useCallback(
    async (prompt: string) => {
      await send(prompt);
      // Refresh dashboard widgets in case the turn sent an email or
      // created/updated a calendar event.
      onActionsCompleted?.();
    },
    [send, onActionsCompleted]
  );

  return (
    <section
      aria-label="AI assistant"
      className="relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent"
    >
      <div className="flex items-center gap-2.5 border-b border-white/5 p-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white">
          <Sparkles className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white">Ask Stelix</h3>
          <p className="truncate text-xs text-zinc-500">
            Natural language for email &amp; calendar.
          </p>
        </div>

        {active && (
          <button
            onClick={reset}
            aria-label="Start a new conversation"
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-zinc-400 transition hover:text-white"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            New
          </button>
        )}
      </div>

      {active ? (
        <div className="max-h-96 flex-1 overflow-y-auto p-4">
          <MessageList messages={messages} loading={loading} compact />
        </div>
      ) : (
        <div className="p-5">
          <p className="text-sm text-zinc-400">
            Try one of these to get started:
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-white/5 p-3">
        <MessageInput onSend={handleSend} disabled={loading} />
      </div>
    </section>
  );
}
