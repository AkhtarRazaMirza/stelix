"use client";

import { memo } from "react";
import { Search, RefreshCw } from "lucide-react";

interface CommandBarProps {
  greeting: string;
  subtitle: string;
  onOpenPalette: () => void;
  onRefresh: () => void;
  refreshing: boolean;
}

function CommandBarComponent({
  greeting,
  subtitle,
  onOpenPalette,
  onRefresh,
  refreshing,
}: CommandBarProps) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          {greeting}
        </h1>
        <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenPalette}
          aria-label="Open command palette"
          aria-keyshortcuts="Meta+K Control+K"
          className="group flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-[#111111] px-3 py-2.5 text-sm text-zinc-500 transition hover:border-white/20 hover:bg-white/[0.04] sm:flex-initial sm:min-w-[260px]"
        >
          <Search className="h-4 w-4" />
          <span className="flex-1 text-left">Search or jump to...</span>
          <kbd className="hidden items-center gap-0.5 rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[11px] text-zinc-400 sm:flex">
            ⌘K
          </kbd>
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          aria-label="Refresh"
          className="flex h-[42px] w-[42px] items-center justify-center rounded-xl border border-white/10 bg-[#111111] text-zinc-400 transition hover:border-white/20 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>
    </header>
  );
}

export const CommandBar = memo(CommandBarComponent);
