"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  getCommandCenterData,
  type CommandCenterData,
} from "@/lib/api/command-center";

type Status = "loading" | "ready" | "error";

interface CommandCenterState {
  data: CommandCenterData | null;
  status: Status;
  refreshing: boolean;
  refresh: () => Promise<void>;
}

// Module-level cache so navigating away and back is instant; the hook
// shows cached data immediately and revalidates in the background.
const CACHE_TTL_MS = 60_000;
let cache: { data: CommandCenterData; fetchedAt: number } | null = null;

export function useCommandCenter(): CommandCenterState {
  const [data, setData] = useState<CommandCenterData | null>(
    cache?.data ?? null
  );
  const [status, setStatus] = useState<Status>(cache ? "ready" : "loading");
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async (background: boolean) => {
    if (background) {
      setRefreshing(true);
    } else {
      setStatus("loading");
    }

    try {
      const next = await getCommandCenterData();
      cache = { data: next, fetchedAt: Date.now() };
      if (!mounted.current) return;
      setData(next);
      setStatus("ready");
    } catch {
      if (!mounted.current) return;
      if (!cache) {
        setStatus("error");
      }
    } finally {
      if (mounted.current) {
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;

    const fresh = cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS;
    if (fresh) {
      setData(cache!.data);
      setStatus("ready");
    } else {
      load(Boolean(cache));
    }

    return () => {
      mounted.current = false;
    };
  }, [load]);

  const refresh = useCallback(() => load(true), [load]);

  return { data, status, refreshing, refresh };
}
