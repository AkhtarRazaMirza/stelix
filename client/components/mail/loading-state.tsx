export function MailLoadingState() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border border-white/10 bg-[#111111] p-4"
        >
          <div className="h-3 w-24 animate-pulse rounded bg-zinc-800" />
          <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-zinc-800" />
          <div className="mt-2 h-3 w-full animate-pulse rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}
