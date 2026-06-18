"use client";

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

      <button
        onClick={() =>
          connected
            ? onDisconnect(id, title)
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
    </div>
  );
}