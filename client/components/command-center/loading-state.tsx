function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-[#111111] ${className}`}
    />
  );
}

export function CommandCenterLoadingState() {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="space-y-3">
        <div className="h-8 w-64 animate-pulse rounded-lg bg-white/5" />
        <div className="h-4 w-96 animate-pulse rounded-lg bg-white/5" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonCard key={index} className="h-24" />
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonCard key={index} className="h-28" />
        ))}
      </div>

      {/* Inbox + Calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SkeletonCard className="h-80" />
        <SkeletonCard className="h-80" />
      </div>

      {/* Upcoming + AI */}
      <SkeletonCard className="h-48" />
      <SkeletonCard className="h-40" />
    </div>
  );
}
