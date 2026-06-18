import {
  Check,
  X,
  Mail,
  Calendar,
  Search,
  type LucideIcon,
} from "lucide-react";

import type { AgentAction, AgentActionCategory } from "@/lib/api/agent";

const CATEGORY_ICON: Record<AgentActionCategory, LucideIcon> = {
  email: Mail,
  calendar: Calendar,
  search: Search,
};

interface ActionResultProps {
  action: AgentAction;
}

interface DetailRow {
  label: string;
  value: string;
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function formatDate(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function formatTime(iso: string | undefined): string | undefined {
  if (!iso) return undefined;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return undefined;
  return new Date(ms).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * Maps a tool's structured `detail` payload to labelled rows for a
 * demo-friendly result card. Returns an empty list when no detail is
 * available, in which case only the summary header is shown.
 */
function buildRows(action: AgentAction): DetailRow[] {
  const detail = action.detail ?? {};
  const rows: DetailRow[] = [];

  if (action.tool === "send_email") {
    const to = asString(detail.to);
    const subject = asString(detail.subject);
    if (to) rows.push({ label: "Recipient", value: to });
    if (subject) rows.push({ label: "Subject", value: subject });
    rows.push({ label: "Status", value: "Sent" });
    return rows;
  }

  if (action.tool === "create_calendar_event") {
    const start = asString(detail.startTime);
    const date = formatDate(start);
    const time = formatTime(start);
    const attendeeCount = asString(detail.attendeeCount);
    if (date) rows.push({ label: "Date", value: date });
    if (time) rows.push({ label: "Time", value: time });
    if (attendeeCount && attendeeCount !== "0") {
      rows.push({ label: "Attendees", value: attendeeCount });
    }
    return rows;
  }

  if (action.tool === "update_calendar_event") {
    const start = asString(detail.startTime);
    const date = formatDate(start);
    const time = formatTime(start);
    if (date) rows.push({ label: "Date", value: date });
    if (time) rows.push({ label: "Time", value: time });
    return rows;
  }

  return rows;
}

/**
 * Derives a short bold title for the card header from the tool, falling back
 * to the model-provided summary for tools without a dedicated title.
 */
function cardTitle(action: AgentAction): string {
  switch (action.tool) {
    case "send_email":
      return action.status === "success" ? "Email Sent" : "Email Failed";
    case "create_calendar_event":
      return action.status === "success"
        ? "Meeting Created"
        : "Meeting Failed";
    case "update_calendar_event":
      return action.status === "success" ? "Event Updated" : "Update Failed";
    case "delete_calendar_event":
      return action.status === "success" ? "Event Cancelled" : "Cancel Failed";
    default:
      return action.summary;
  }
}

export function ActionResult({ action }: ActionResultProps) {
  const Icon = CATEGORY_ICON[action.category] ?? Mail;
  const success = action.status === "success";
  const rows = success ? buildRows(action) : [];
  const title = cardTitle(action);
  const showSubtitle = title !== action.summary;

  return (
    <div
      className={`rounded-xl border px-3 py-2.5 text-sm ${
        success
          ? "border-emerald-500/20 bg-emerald-500/[0.06]"
          : "border-red-500/20 bg-red-500/[0.06]"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
            success
              ? "bg-emerald-500/15 text-emerald-400"
              : "bg-red-500/15 text-red-400"
          }`}
        >
          {success ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <X className="h-3.5 w-3.5" />
          )}
        </span>

        <Icon className="h-4 w-4 shrink-0 text-zinc-500" />

        <span
          className={`font-medium ${success ? "text-white" : "text-red-300"}`}
        >
          {title}
        </span>
      </div>

      {showSubtitle && (
        <p className="mt-1 pl-[2.25rem] text-xs text-zinc-400">
          {action.summary}
        </p>
      )}

      {rows.length > 0 && (
        <dl className="mt-2 space-y-1 pl-[2.25rem]">
          {rows.map((row) => (
            <div key={row.label} className="flex gap-2 text-xs">
              <dt className="w-20 shrink-0 text-zinc-500">{row.label}</dt>
              <dd className="min-w-0 flex-1 truncate text-zinc-200">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
