"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import { createEvent, inviteAttendees } from "@/lib/api/calendar";
import { ApiError } from "@/lib/api/client";
import type { CreateEventInput } from "@/types/calendar";

interface CreateEventModalProps {
  defaultStart: string;
  defaultEnd: string;
  onClose: () => void;
  onCreated: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FormState {
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  attendees: string;
}

function parseAttendees(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function CreateEventModal({
  defaultStart,
  defaultEnd,
  onClose,
  onCreated,
}: CreateEventModalProps) {
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    location: "",
    start: defaultStart,
    end: defaultEnd,
    attendees: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (form.title.trim().length === 0) {
      setError("Title is required.");
      return;
    }

    const start = new Date(form.start);
    const end = new Date(form.end);

    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) {
      setError("Valid start and end times are required.");
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setError("End time must be after start time.");
      return;
    }

    const attendees = parseAttendees(form.attendees);
    const invalid = attendees.filter((email) => !EMAIL_PATTERN.test(email));

    if (invalid.length > 0) {
      setError(`Invalid attendee email: ${invalid[0]}`);
      return;
    }

    const payload: CreateEventInput = {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      location: form.location.trim() || undefined,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
      attendees: attendees.length > 0 ? attendees : undefined,
    };

    setSaving(true);
    setError("");

    try {
      if (attendees.length > 0) {
        await inviteAttendees(payload);
      } else {
        await createEvent(payload);
      }

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create event. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111111] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">New Event</h2>

          <button
            onClick={onClose}
            disabled={saving}
            className="text-zinc-500 transition hover:text-white disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3 p-6">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <input
            value={form.title}
            onChange={(event) => update("title", event.target.value)}
            placeholder="Event title"
            disabled={saving}
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Start
              </label>
              <input
                type="datetime-local"
                value={form.start}
                onChange={(event) => update("start", event.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-white/20 disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-zinc-500">End</label>
              <input
                type="datetime-local"
                value={form.end}
                onChange={(event) => update("end", event.target.value)}
                disabled={saving}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-white/20 disabled:opacity-50"
              />
            </div>
          </div>

          <input
            value={form.location}
            onChange={(event) => update("location", event.target.value)}
            placeholder="Location (optional)"
            disabled={saving}
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />

          <input
            value={form.attendees}
            onChange={(event) => update("attendees", event.target.value)}
            placeholder="Attendees (comma separated emails)"
            disabled={saving}
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />

          <textarea
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
            placeholder="Description (optional)"
            rows={4}
            disabled={saving}
            className="w-full resize-none rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Saving..." : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
}
