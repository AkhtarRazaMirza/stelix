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
  Plus,
  UserPlus,
} from "lucide-react";

import { deleteEvent, updateEvent } from "@/lib/api/calendar";
import { ApiError } from "@/lib/api/client";
import type { CalendarAttendee, EventDetail } from "@/types/calendar";

interface EventDetailsProps {
  event: EventDetail;
  onClose: () => void;
  onReschedule: (event: EventDetail) => void;
  onDeleted: () => void;
  /** Called after the guest list changes, so the parent can refresh lists. */
  onUpdated?: (event: EventDetail) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  onUpdated,
}: EventDetailsProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [attendees, setAttendees] = useState<CalendarAttendee[]>(
    event.attendees
  );
  const [newAttendee, setNewAttendee] = useState("");
  const [savingAttendees, setSavingAttendees] = useState(false);

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

  // Persists a new guest list via the existing updateEvent API. The backend
  // replaces the full attendee set, so we always send the complete list and
  // notify everyone of the change.
  async function persistAttendees(emails: string[]) {
    setSavingAttendees(true);
    setError("");

    try {
      const { event: updated } = await updateEvent(event.id, {
        attendees: emails,
      });
      setAttendees(updated.attendees);
      onUpdated?.(updated);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to update attendees."
      );
    } finally {
      setSavingAttendees(false);
    }
  }

  async function handleAddAttendee() {
    const email = newAttendee.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (attendees.some((a) => a.email.toLowerCase() === email)) {
      setError("That attendee is already invited.");
      return;
    }

    const emails = [...attendees.map((a) => a.email), email];
    setNewAttendee("");
    await persistAttendees(emails);
  }

  async function handleRemoveAttendee(target: string) {
    const emails = attendees
      .map((a) => a.email)
      .filter((email) => email.toLowerCase() !== target.toLowerCase());
    await persistAttendees(emails);
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

        <div>
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Users className="h-4 w-4 text-zinc-500" />
            Attendees ({attendees.length})
            {savingAttendees && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-zinc-500" />
            )}
          </div>

          {attendees.length > 0 && (
            <ul className="space-y-1">
              {attendees.map((attendee) => (
                <li
                  key={attendee.email}
                  className="group flex items-center justify-between gap-2 text-zinc-400"
                >
                  <span className="truncate">
                    {attendee.displayName || attendee.email}
                  </span>

                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {attendee.responseStatus}
                    </span>
                    {!attendee.organizer && (
                      <button
                        onClick={() => handleRemoveAttendee(attendee.email)}
                        disabled={savingAttendees}
                        aria-label={`Remove ${attendee.email}`}
                        className="text-zinc-600 transition hover:text-red-400 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-2 flex items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-500">
              <UserPlus className="h-4 w-4" />
            </span>
            <input
              type="email"
              value={newAttendee}
              onChange={(e) => setNewAttendee(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  void handleAddAttendee();
                }
              }}
              placeholder="Add attendee by email"
              disabled={savingAttendees}
              aria-label="Add attendee by email"
              className="h-9 flex-1 rounded-lg border border-white/10 bg-black px-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-white/20 disabled:opacity-50"
            />
            <button
              onClick={() => void handleAddAttendee()}
              disabled={savingAttendees || newAttendee.trim().length === 0}
              aria-label="Add attendee"
              className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-sm text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

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
