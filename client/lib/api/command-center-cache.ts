/** Client-only in-memory cache for Command Center data; never persisted or shared. */
export type CommandCenterCacheKey =
  | "integrations"
  | "inbox-preview"
  | "sent-preview"
  | "todays-events"
  | "dashboard-metrics"
  | "assistant-summary";

export interface CacheEntry<T> {
  data?: T;
  timestamp?: number;
  expiry?: number;
  inFlightPromise?: Promise<T>;
  generation: number;
}

export const CACHE_TTL_MS: Record<CommandCenterCacheKey, number> = {
  integrations: 60_000,
  "inbox-preview": 45_000,
  "sent-preview": 45_000,
  "todays-events": 30_000,
  "dashboard-metrics": 30_000,
  "assistant-summary": 30_000,
};

const entries: Record<CommandCenterCacheKey, CacheEntry<unknown>> = {
  integrations: { generation: 0 },
  "inbox-preview": { generation: 0 },
  "sent-preview": { generation: 0 },
  "todays-events": { generation: 0 },
  "dashboard-metrics": { generation: 0 },
  "assistant-summary": { generation: 0 },
};

/** Returns unexpired cached data, or the one identical request already in progress. */
export function getOrLoadCommandCenterCache<T>(
  key: CommandCenterCacheKey,
  ttlMs: number,
  load: () => Promise<T>
): Promise<T> {
  const entry = entries[key] as CacheEntry<T>;
  const now = Date.now();

  if (entry.data !== undefined && entry.expiry !== undefined && now < entry.expiry) {
    return Promise.resolve(entry.data);
  }
  if (entry.inFlightPromise) return entry.inFlightPromise;

  const generation = entry.generation;
  let request: Promise<T>;
  request = load()
    .then((data) => {
      // Invalidations while a request runs cannot repopulate stale data.
      if (entry.generation === generation) {
        const timestamp = Date.now();
        entry.data = data;
        entry.timestamp = timestamp;
        entry.expiry = timestamp + ttlMs;
      }
      return data;
    })
    .finally(() => {
      if (entry.inFlightPromise === request) entry.inFlightPromise = undefined;
    });
  entry.inFlightPromise = request;
  return request;
}

export function invalidateCommandCenterCache(
  keys: CommandCenterCacheKey[] = Object.keys(entries) as CommandCenterCacheKey[]
): void {
  for (const key of keys) {
    const entry = entries[key];
    if (entry) {
      entry.generation += 1;
      entry.data = undefined;
      entry.timestamp = undefined;
      entry.expiry = undefined;
      entry.inFlightPromise = undefined;
    }
  }
}
