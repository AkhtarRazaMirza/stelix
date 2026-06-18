"use client";

import { Sparkles } from "lucide-react";

import type { ChatMessage } from "./types";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";

const EXAMPLE_PROMPTS = [
  "Send an email to john@example.com saying I'll be 10 minutes late",
  "Schedule a meeting tomorrow at 3 PM",
  "Find emails from Sarah",
  "What meetings do I have this week?",
];

interface ChatInterfaceProps {
  messages: ChatMessage[];
  loading: boolean;
  onSend: (message: string) => void;
  /** Renders without an outer card border — for embedding inside another card. */
  embedded?: boolean;
  className?: string;
}

export function ChatInterface({
  messages,
  loading,
  onSend,
  embedded = false,
  className = "",
}: ChatInterfaceProps) {
  const empty = messages.length === 0;

  return (
    <div
      className={`flex flex-col ${
        embedded
          ? ""
          : "rounded-2xl border border-white/10 bg-[#111111]"
      } ${className}`}
    >
      <div className="flex-1 overflow-y-auto p-4">
        {empty ? (
          <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white">
              <Sparkles className="h-5 w-5" />
            </span>

            <h3 className="mt-4 text-base font-semibold text-white">
              Ask Stelix anything
            </h3>
            <p className="mt-1 max-w-sm text-sm text-zinc-500">
              Control your email and calendar with natural language. Try one of
              these:
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {EXAMPLE_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSend(prompt)}
                  disabled={loading}
                  className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <MessageList messages={messages} loading={loading} />
        )}
      </div>

      <div className="border-t border-white/10 p-3">
        <MessageInput onSend={onSend} disabled={loading} />
      </div>
    </div>
  );
}
