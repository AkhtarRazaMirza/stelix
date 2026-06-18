"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Search,
  Loader2,
  Mail,
  Calendar,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";

import { searchEmails } from "@/lib/api/gmail";
import { searchEvents } from "@/lib/api/calendar";

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  keywords?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  /** Static commands: pages + quick actions. */
  staticItems: CommandItem[];
  /** Enables live email search results. */
  gmailConnected: boolean;
  /** Enables live event search results. */
  calendarConnected: boolean;
  onSelectEmail: (emailId: string) => void;
  onSelectEvent: (eventId: string) => void;
}

interface RemoteResults {
  items: CommandItem[];
  loading: boolean;
}

const DEBOUNCE_MS = 250;

function useDebounced(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

export function CommandPalette({
  open,
  onClose,
  staticItems,
  gmailConnected,
  calendarConnected,
  onSelectEmail,
  onSelectEvent,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [remote, setRemote] = useState<RemoteResults>({
    items: [],
    loading: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounced(query, DEBOUNCE_MS);
  const requestId = useRef(0);

  // Reset state whenever the palette opens.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setRemote({ items: [], loading: false });
      const handle = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(handle);
    }
  }, [open]);

  // Live search over Gmail + Calendar, reusing existing search endpoints.
  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    if (!open || trimmed.length < 2) {
      setRemote({ items: [], loading: false });
      return;
    }

    if (!gmailConnected && !calendarConnected) {
      return;
    }

    const id = ++requestId.current;
    setRemote((prev) => ({ ...prev, loading: true }));

    Promise.allSettled([
      gmailConnected ? searchEmails(trimmed) : Promise.resolve(null),
      calendarConnected ? searchEvents(trimmed) : Promise.resolve(null),
    ]).then(([emailRes, eventRes]) => {
      if (id !== requestId.current) {
        return;
      }

      const items: CommandItem[] = [];

      if (emailRes.status === "fulfilled" && emailRes.value) {
        for (const email of emailRes.value.emails.slice(0, 5)) {
          items.push({
            id: `email-${email.id}`,
            label: email.subject || "(no subject)",
            hint: email.from,
            group: "Emails",
            icon: Mail,
            onSelect: () => onSelectEmail(email.id),
          });
        }
      }

      if (eventRes.status === "fulfilled" && eventRes.value) {
        for (const event of eventRes.value.events.slice(0, 5)) {
          items.push({
            id: `event-${event.id}`,
            label: event.title,
            hint: new Date(event.startTime).toLocaleString(),
            group: "Events",
            icon: Calendar,
            onSelect: () => onSelectEvent(event.id),
          });
        }
      }

      setRemote({ items, loading: false });
    });
  }, [
    debouncedQuery,
    open,
    gmailConnected,
    calendarConnected,
    onSelectEmail,
    onSelectEvent,
  ]);

  // Filter static items locally.
  const filteredStatic = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (trimmed.length === 0) {
      return staticItems;
    }
    return staticItems.filter((item) =>
      `${item.label} ${item.hint ?? ""} ${item.keywords ?? ""} ${item.group}`
        .toLowerCase()
        .includes(trimmed)
    );
  }, [query, staticItems]);

  const allItems = useMemo(
    () => [...filteredStatic, ...remote.items],
    [filteredStatic, remote.items]
  );

  // Keep the active index within bounds as results change.
  useEffect(() => {
    setActiveIndex((prev) =>
      allItems.length === 0 ? 0 : Math.min(prev, allItems.length - 1)
    );
  }, [allItems.length]);

  const runSelection = useCallback(
    (item: CommandItem | undefined) => {
      if (!item) return;
      onClose();
      item.onSelect();
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) =>
          allItems.length === 0 ? 0 : (prev + 1) % allItems.length
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) =>
          allItems.length === 0
            ? 0
            : (prev - 1 + allItems.length) % allItems.length
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        runSelection(allItems[activeIndex]);
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    },
    [allItems, activeIndex, runSelection, onClose]
  );

  // Scroll the active item into view.
  useEffect(() => {
    const node = listRef.current?.querySelector(
      `[data-index="${activeIndex}"]`
    );
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) {
    return null;
  }

  // Group items for display while preserving the flat index for navigation.
  let runningIndex = -1;
  const groups = new Map<string, { item: CommandItem; index: number }[]>();
  for (const item of allItems) {
    runningIndex += 1;
    const bucket = groups.get(item.group) ?? [];
    bucket.push({ item, index: runningIndex });
    groups.set(item.group, bucket);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-white/10 px-4">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search emails, events, pages, actions..."
            aria-label="Search"
            className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          />

          {remote.loading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-500" />
          )}
        </div>

        <div ref={listRef} className="max-h-[50vh] overflow-y-auto p-2">
          {allItems.length === 0 ? (
            <div className="px-3 py-10 text-center text-sm text-zinc-500">
              {query.trim().length > 0
                ? "No results found."
                : "Type to search."}
            </div>
          ) : (
            Array.from(groups.entries()).map(([group, entries]) => (
              <div key={group} className="mb-2">
                <p className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-zinc-600">
                  {group}
                </p>

                {entries.map(({ item, index }) => {
                  const Icon = item.icon;
                  const active = index === activeIndex;

                  return (
                    <button
                      key={item.id}
                      data-index={index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => runSelection(item)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                        active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 shrink-0 ${
                          active ? "text-white" : "text-zinc-500"
                        }`}
                      />

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm text-white">
                          {item.label}
                        </span>
                        {item.hint && (
                          <span className="block truncate text-xs text-zinc-500">
                            {item.hint}
                          </span>
                        )}
                      </span>

                      {active && (
                        <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] text-zinc-600">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
                ↑
              </kbd>
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
                ↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
                ↵
              </kbd>
              select
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
                C
              </kbd>
              compose
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
                M
              </kbd>
              meeting
            </span>
          </span>

          <span className="flex items-center gap-1">
            <kbd className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5">
              esc
            </kbd>
            close
          </span>
        </div>
      </div>
    </div>
  );
}
