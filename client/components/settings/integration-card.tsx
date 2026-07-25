"use client";

import { useState } from "react";

interface IntegrationCardProps {
  id: string;
  title: string;
  description: string;
  connected: boolean;
  loading?: boolean;
  onConnect: (id: string, provider: string) => void;
  onDisconnect: (id: string, provider: string) => void;
}

export function IntegrationCard({
  id,
  title,
  description,
  connected,
  loading,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const [confirmingDisconnect, setConfirmingDisconnect] = useState(false);

  return (
    <div className="rounded-xl border border-white/10 bg-[#111111] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">
            {title}
          </h3>

          <p className="mt-1 text-sm text-zinc-400">
            {description}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs ${connected
              ? "bg-green-500/20 text-green-400"
              : "bg-zinc-700 text-zinc-300"
            }`}
        >
          {connected
            ? "Connected"
            : "Not Connected"}
        </span>
      </div>

      {connected && confirmingDisconnect ? (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-zinc-400">
            Disconnect {title}? Stelix will lose access until you reconnect.
          </p>

          <div className="flex gap-2">
            <button
              onClick={() => setConfirmingDisconnect(false)}
              disabled={loading}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={() => onDisconnect(id, title)}
              disabled={loading}
              className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10 disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Confirm Disconnect"}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() =>
            connected
              ? setConfirmingDisconnect(true)
              : onConnect(id, title)
          }
          disabled={loading}
          className={`mt-4 rounded-lg border px-4 py-2 text-sm transition disabled:opacity-50 ${connected
              ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
              : "border-white/10 hover:bg-white/5"
            }`}
        >
          {loading
            ? "Please wait..."
            : connected
              ? "Disconnect"
              : "Connect"}
        </button>
      )}
    </div>
  );
}