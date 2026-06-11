import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Settings"
          description="Manage integrations and preferences."
        />

        <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
          Settings panel coming soon...
        </div>
      </div>
    </AppShell>
  );
}