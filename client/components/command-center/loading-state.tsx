function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-white/10 bg-[#111111] ${className}`}
    />
  );
}

/**
 * Skeleton rows for the body of a WidgetCard (Inbox / Calendar / Upcoming /
 * Activity). Used while an individual section is still loading so each
 * widget can render its own placeholder instead of a full-page gate.
 */
export function WidgetSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3"
        >
          <div className="h-8 w-8 shrink-0 animate-pulse rounded-lg bg-white/5" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-white/5" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton grid of metric tiles for the productivity summary. */
export function MetricsSkeleton({ tiles = 4 }: { tiles?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: tiles }).map((_, index) => (
        <SkeletonCard key={index} className="h-28" />
      ))}
    </div>
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
