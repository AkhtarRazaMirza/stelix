"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import { rescheduleEvent } from "@/lib/api/calendar";
import { ApiError } from "@/lib/api/client";
import type { EventDetail } from "@/types/calendar";
import { toDateTimeLocalValue } from "./calendar-utils";

interface RescheduleModalProps {
  event: EventDetail;
  onClose: () => void;
  onRescheduled: () => void;
}

export function RescheduleModal({
  event,
  onClose,
  onRescheduled,
}: RescheduleModalProps) {
  const [start, setStart] = useState(() =>
    toDateTimeLocalValue(new Date(event.startTime))
  );
  const [end, setEnd] = useState(() =>
    toDateTimeLocalValue(new Date(event.endTime))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      !Number.isFinite(startDate.getTime()) ||
      !Number.isFinite(endDate.getTime())
    ) {
      setError("Valid start and end times are required.");
      return;
    }

    if (endDate.getTime() <= startDate.getTime()) {
      setError("End time must be after start time.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await rescheduleEvent({
        eventId: event.id,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      });

      onRescheduled();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to reschedule. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">Reschedule</h2>

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

          <p className="truncate text-sm text-zinc-400">{event.title}</p>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">Start</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-white/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-zinc-500">End</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              disabled={saving}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-white/20 disabled:opacity-50"
            />
          </div>

          <p className="text-xs text-zinc-500">
            Attendees will be notified of the new time.
          </p>
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
            {saving ? "Saving..." : "Reschedule"}
          </button>
        </div>
      </div>
    </div>
  );
}
