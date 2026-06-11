import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

export default function AssistantPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="AI Assistant"
          description="Use natural language to manage email and calendar."
        />

        <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
          Chat interface coming soon...
        </div>
      </div>
    </AppShell>
  );
}