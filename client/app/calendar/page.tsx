import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default function CalendarPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <PageHeader
          title="Calendar"
          description="Manage meetings and events."
        />

        <EmptyState
          title="No events found"
          description="Connect Google Calendar to start syncing."
        />
      </div>
    </AppShell>
  );
}