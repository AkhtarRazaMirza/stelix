export function CalendarLoadingState() {
  return (
    <div className="space-y-3">
      <div className="h-10 w-48 animate-pulse rounded bg-zinc-800" />
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg bg-zinc-800/60"
          />
        ))}
      </div>
    </div>
  );
}
