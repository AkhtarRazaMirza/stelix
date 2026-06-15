interface IntegrationCardProps {
  title: string;
  description: string;
  connected: boolean;
}

export function IntegrationCard({
  title,
  description,
  connected,
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
          className={`rounded-full px-3 py-1 text-xs ${
            connected
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
        className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5"
      >
        {connected
          ? "Disconnect"
          : "Connect"}
      </button>
    </div>
  );
}