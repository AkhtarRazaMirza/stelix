"use client";

import { memo, useMemo } from "react";
import {
  PenSquare,
  CalendarPlus,
  Users,
  Inbox,
  Calendar,
  type LucideIcon,
} from "lucide-react";

export interface QuickAction {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  onSelect: () => void;
}

interface QuickActionsProps {
  onCompose: () => void;
  onCreateEvent: () => void;
  onScheduleMeeting: () => void;
  onOpenInbox: () => void;
  onOpenCalendar: () => void;
}

export function buildQuickActions({
  onCompose,
  onCreateEvent,
  onScheduleMeeting,
  onOpenInbox,
  onOpenCalendar,
}: QuickActionsProps): QuickAction[] {
  return [
    {
      id: "compose",
      label: "Compose Email",
      hint: "Write a new message",
      icon: PenSquare,
      onSelect: onCompose,
    },
    {
      id: "create-event",
      label: "Create Event",
      hint: "Add to calendar",
      icon: CalendarPlus,
      onSelect: onCreateEvent,
    },
    {
      id: "schedule-meeting",
      label: "Schedule Meeting",
      hint: "Invite attendees",
      icon: Users,
      onSelect: onScheduleMeeting,
    },
    {
      id: "open-inbox",
      label: "Open Inbox",
      hint: "Go to Mail",
      icon: Inbox,
      onSelect: onOpenInbox,
    },
    {
      id: "open-calendar",
      label: "Open Calendar",
      hint: "View schedule",
      icon: Calendar,
      onSelect: onOpenCalendar,
    },
  ];
}

function QuickActionsComponent(props: QuickActionsProps) {
  const actions = useMemo(
    () => buildQuickActions(props),
    [
      props.onCompose,
      props.onCreateEvent,
      props.onScheduleMeeting,
      props.onOpenInbox,
      props.onOpenCalendar,
    ]
  );

  return (
    <section aria-label="Quick actions">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.id}
              onClick={action.onSelect}
              className="group flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#111111] p-4 text-left transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition group-hover:text-white">
                <Icon className="h-4 w-4" />
              </span>

              <span>
                <span className="block text-sm font-medium text-white">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-xs text-zinc-500">
                  {action.hint}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export const QuickActions = memo(QuickActionsComponent);
