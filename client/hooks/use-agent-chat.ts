"use client";

import { useCallback, useState } from "react";

import { sendAgentMessage } from "@/lib/api/agent";
import { ApiError } from "@/lib/api/client";
import type { ChatMessage } from "@/components/agent/types";

function createId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
}

interface UseAgentChat {
  messages: ChatMessage[];
  loading: boolean;
  send: (message: string) => Promise<void>;
  reset: () => void;
}

/**
 * Shared agent chat state. Used by both the full /agent page and the inline
 * Command Center AI panel so there is a single chat implementation.
 */
export function useAgentChat(): UseAgentChat {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const send = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (trimmed.length === 0 || loading) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
      };

      setMessages((prev) => [...prev, userMessage]);
      setLoading(true);

      try {
        const result = await sendAgentMessage(trimmed);

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content: result.response,
            actions: result.actions,
          },
        ]);
      } catch (error) {
        const content =
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.";

        setMessages((prev) => [
          ...prev,
          {
            id: createId(),
            role: "assistant",
            content,
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const reset = useCallback(() => setMessages([]), []);

  return { messages, loading, send, reset };
}
