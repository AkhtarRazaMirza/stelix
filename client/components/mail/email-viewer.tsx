"use client";

import { Reply } from "lucide-react";
import type { EmailDetail } from "@/types/gmail";

interface EmailViewerProps {
  email: EmailDetail;
  onReply: (email: EmailDetail) => void;
}

function formatFullDate(value: string): string {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function EmailViewer({ email, onReply }: EmailViewerProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">
            {email.subject || "(no subject)"}
          </h2>

          <button
            onClick={() => onReply(email)}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 py-1.5 text-sm transition hover:bg-white/5"
          >
            <Reply className="h-4 w-4" />
            Reply
          </button>
        </div>

        <div className="mt-4 space-y-1 text-sm">
          <p className="text-zinc-300">
            <span className="text-zinc-500">From: </span>
            {email.from}
          </p>

          {email.to && (
            <p className="text-zinc-300">
              <span className="text-zinc-500">To: </span>
              {email.to}
            </p>
          )}

          <p className="text-zinc-500">{formatFullDate(email.receivedAt)}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {email.htmlBody ? (
          <div
            className="prose prose-invert max-w-none text-sm text-zinc-200 [&_a]:text-blue-400"
            dangerouslySetInnerHTML={{ __html: email.htmlBody }}
          />
        ) : (
          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-zinc-200">
            {email.body || "(no content)"}
          </pre>
        )}

        {email.attachments.length > 0 && (
          <div className="mt-6 border-t border-white/10 pt-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Attachments
            </p>

            <ul className="space-y-1">
              {email.attachments.map((attachment) => (
                <li
                  key={attachment.attachmentId}
                  className="text-sm text-zinc-300"
                >
                  {attachment.filename}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
