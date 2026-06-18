"use client";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { ChatInterface } from "@/components/agent/chat-interface";
import { useAgentChat } from "@/hooks/use-agent-chat";

export default function AgentPage() {
  const { messages, loading, send } = useAgentChat();

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-3xl flex-col gap-6">
        <PageHeader
          title="Stelix Agent"
          description="Control Gmail and Calendar with natural language."
        />

        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={send}
          className="min-h-0 flex-1"
        />
      </div>
    </AppShell>
  );
}
