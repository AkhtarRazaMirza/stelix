"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import { sendEmail } from "@/lib/api/gmail";
import { ApiError } from "@/lib/api/client";
import type { SendEmailInput } from "@/types/gmail";

interface ComposeEmailModalProps {
  initialTo?: string;
  initialSubject?: string;
  onClose: () => void;
  onSent: () => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ComposeEmailModal({
  initialTo = "",
  initialSubject = "",
  onClose,
  onSent,
}: ComposeEmailModalProps) {
  const [form, setForm] = useState<SendEmailInput>({
    to: initialTo,
    subject: initialSubject,
    body: "",
  });

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof SendEmailInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSend() {
    if (!EMAIL_PATTERN.test(form.to.trim())) {
      setError("Enter a valid recipient email address.");
      return;
    }

    if (form.subject.trim().length === 0) {
      setError("Subject is required.");
      return;
    }

    if (form.body.trim().length === 0) {
      setError("Message body is required.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await sendEmail({
        to: form.to.trim(),
        subject: form.subject.trim(),
        body: form.body,
      });

      onSent();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to send email. Please try again."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#111111] shadow-xl">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold text-white">New Message</h2>

          <button
            onClick={onClose}
            disabled={sending}
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
            value={form.to}
            onChange={(event) => update("to", event.target.value)}
            placeholder="To"
            type="email"
            disabled={sending}
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />

          <input
            value={form.subject}
            onChange={(event) => update("subject", event.target.value)}
            placeholder="Subject"
            disabled={sending}
            className="w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />

          <textarea
            value={form.body}
            onChange={(event) => update("body", event.target.value)}
            placeholder="Write your message..."
            rows={10}
            disabled={sending}
            className="w-full resize-none rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20 disabled:opacity-50"
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            onClick={onClose}
            disabled={sending}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {sending && <Loader2 className="h-4 w-4 animate-spin" />}
            {sending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
