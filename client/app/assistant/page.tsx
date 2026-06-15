"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const prompt = input;
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:8000/api/assistant",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: prompt,
          }),
        }
      );

      const data = await response.json();

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="AI Assistant"
          description="Use natural language to manage email and calendar."
        />

        <div className="flex h-[600px] flex-col rounded-xl border border-white/10 bg-[#111111]">
          <div className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.length === 0 && (
              <p className="text-sm text-zinc-500">
                Try:
                <br />
                • Show my emails
                <br />
                • Show my events
              </p>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[80%] rounded-xl p-4 ${
                  message.role === "user"
                    ? "ml-auto bg-white text-black"
                    : "bg-white/5"
                }`}
              >
                {message.content}
              </div>
            ))}

            {loading && (
              <div className="rounded-xl bg-white/5 p-4">
                Thinking...
              </div>
            )}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                placeholder="Ask Stelix..."
                className="flex-1 rounded-lg border border-white/10 bg-black px-4 py-3 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSend();
                  }
                }}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="rounded-lg bg-white px-4 py-3 text-black"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}