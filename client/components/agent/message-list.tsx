"use client";

import { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";

import type { ChatMessage } from "./types";
import { ActionResult } from "./action-result";
import { TypingIndicator } from "./typing-indicator";

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  compact?: boolean;
}

export function MessageList({ messages, loading, compact }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  return (
    <div className={`space-y-4 ${compact ? "" : "px-1"}`}>
      {messages.map((message) =>
        message.role === "user" ? (
          <div key={message.id} className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-white px-4 py-2.5 text-sm text-black">
              {message.content}
            </div>
          </div>
        ) : (
          <div key={message.id} className="flex gap-3">
            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white">
              <Sparkles className="h-3.5 w-3.5" />
            </span>

            <div className="min-w-0 flex-1 space-y-2">
              {message.actions && message.actions.length > 0 && (
                <div className="space-y-1.5">
                  {message.actions.map((action, index) => (
                    <ActionResult
                      key={`${message.id}-${index}`}
                      action={action}
                    />
                  ))}
                </div>
              )}

              {message.content && (
                <div
                  className={`whitespace-pre-wrap rounded-2xl rounded-tl-sm border px-4 py-2.5 text-sm ${
                    message.error
                      ? "border-red-500/20 bg-red-500/[0.06] text-red-300"
                      : "border-white/10 bg-white/[0.03] text-zinc-200"
                  }`}
                >
                  {message.content}
                </div>
              )}
            </div>
          </div>
        )
      )}

      {loading && (
        <div className="flex gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white">
            <Sparkles className="h-3.5 w-3.5" />
          </span>
          <TypingIndicator />
        </div>
      )}

      <div ref={endRef} />
    </div>
  );
}
