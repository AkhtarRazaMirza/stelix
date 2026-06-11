import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Dashboard"
          description="Manage email, calendar and AI workflows."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Emails Today"
            value="24"
          />

          <StatCard
            title="Meetings"
            value="6"
          />

          <StatCard
            title="AI Actions"
            value="12"
          />
        </div>
      </div>
    </AppShell>
  );
}