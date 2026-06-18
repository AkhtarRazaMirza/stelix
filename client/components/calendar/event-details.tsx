"use client";

import { useState } from "react";
import {
  X,
  MapPin,
  Clock,
  Users,
  Trash2,
  CalendarClock,
  ExternalLink,
  Loader2,
} from "lucide-react";

import { deleteEvent } from "@/lib/api/calendar";
import { ApiError } from "@/lib/api/client";
import type { EventDetail } from "@/types/calendar";

interface EventDetailsProps {
  event: EventDetail;
  onClose: () => void;
  onReschedule: (event: EventDetail) => void;
  onDeleted: () => void;
}

function formatRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (!Number.isFinite(startDate.getTime())) {
    return "";
  }

  const datePart = startDate.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const startTime = startDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = Number.isFinite(endDate.getTime())
    ? endDate.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return `${datePart} · ${startTime}${endTime ? ` – ${endTime}` : ""}`;
}

export function EventDetails({
  event,
  onClose,
  onReschedule,
  onDeleted,
}: EventDetailsProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setDeleting(true);
    setError("");

    try {
      await deleteEvent(event.id);
      onDeleted();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to delete this event."
      );
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
        <h2 className="text-lg font-semibold text-white">{event.title}</h2>

        <button
          onClick={onClose}
          className="text-zinc-500 transition hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5 text-sm">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 text-zinc-300">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          {formatRange(event.startTime, event.endTime)}
        </div>

        {event.location && (
          <div className="flex items-start gap-3 text-zinc-300">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
            {event.location}
          </div>
        )}

        {event.description && (
          <p className="whitespace-pre-wrap text-zinc-400">
            {event.description}
          </p>
        )}

        {event.attendees.length > 0 && (
          <div>
            <div className="mb-2 flex items-center gap-2 text-zinc-300">
              <Users className="h-4 w-4 text-zinc-500" />
              Attendees ({event.attendees.length})
            </div>

            <ul className="space-y-1">
              {event.attendees.map((attendee) => (
                <li
                  key={attendee.email}
                  className="flex items-center justify-between gap-2 text-zinc-400"
                >
                  <span className="truncate">
                    {attendee.displayName || attendee.email}
                  </span>
                  <span className="shrink-0 text-xs text-zinc-500">
                    {attendee.responseStatus}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.htmlLink && (
          <a
            href={event.htmlLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline"
          >
            Open in Google Calendar
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 p-4">
        <button
          onClick={() => onReschedule(event)}
          className="flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm transition hover:bg-white/5"
        >
          <CalendarClock className="h-4 w-4" />
          Reschedule
        </button>

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Delete
        </button>
      </div>
    </div>
  );
}
