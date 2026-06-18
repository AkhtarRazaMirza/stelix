"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

interface CommandCenterErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  compact?: boolean;
}

export function CommandCenterErrorState({
  title = "Something went wrong",
  description = "We couldn't load this section. Please try again.",
  onRetry,
  compact = false,
}: CommandCenterErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.06] text-center ${
        compact ? "p-6" : "p-10"
      }`}
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
        <AlertTriangle className="h-5 w-5 text-red-400" />
      </div>

      <h3 className="text-sm font-semibold text-red-300">{title}</h3>

      <p className="mt-1 max-w-xs text-sm text-zinc-400">{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}
