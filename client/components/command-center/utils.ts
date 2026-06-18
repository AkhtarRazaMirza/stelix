/**
 * Returns a human-readable countdown to a future time, e.g.
 * "in 12 minutes", "in 1 hour", "tomorrow". Used by upcoming meetings.
 */
export function relativeCountdown(startTime: string): string {
  const start = new Date(startTime).getTime();
  if (!Number.isFinite(start)) {
    return "";
  }

  const diffMs = start - Date.now();
  if (diffMs <= 0) {
    return "Now";
  }

  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 60) {
    return `in ${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  }

  const start24 = new Date(startTime);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  if (start24.toDateString() === tomorrow.toDateString()) {
    return "tomorrow";
  }

  const days = Math.round(hours / 24);
  return `in ${days} day${days === 1 ? "" : "s"}`;
}

export function clockTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function dayAndTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }
  return date.toLocaleString(undefined, {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function senderName(from: string): string {
  const match = from.match(/^(.*?)</);
  const name = match ? match[1].trim().replace(/^"|"$/g, "") : from;
  return name.length > 0 ? name : from;
}

export function inboxTime(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "";
  }
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();

  return sameDay
    ? date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      })
    : date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
}
