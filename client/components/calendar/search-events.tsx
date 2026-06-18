"use client";

import { useEffect, useRef, useState } from "react";
import { Search, Loader2, X } from "lucide-react";

interface SearchEventsProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  searching: boolean;
}

const DEBOUNCE_MS = 350;

export function SearchEvents({
  onSearch,
  onClear,
  searching,
}: SearchEventsProps) {
  const [value, setValue] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, []);

  function handleChange(next: string) {
    setValue(next);

    if (timer.current) {
      clearTimeout(timer.current);
    }

    const trimmed = next.trim();

    if (trimmed.length === 0) {
      onClear();
      return;
    }

    timer.current = setTimeout(() => {
      onSearch(trimmed);
    }, DEBOUNCE_MS);
  }

  function handleClear() {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    setValue("");
    onClear();
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

      <input
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search events..."
        className="w-full rounded-xl border border-white/10 bg-[#111111] py-2.5 pl-10 pr-10 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-white/20"
      />

      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {searching ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
        ) : (
          value.length > 0 && (
            <button
              onClick={handleClear}
              className="text-zinc-500 transition hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )
        )}
      </div>
    </div>
  );
}
