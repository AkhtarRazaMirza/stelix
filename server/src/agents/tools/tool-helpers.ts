/**
 * Safe, typed extraction helpers for model-generated tool arguments.
 *
 * The LLM may hallucinate or omit parameters, so every value coming from
 * tool-call arguments must be validated here before it reaches a service.
 * This is a core part of the agent's input-sanitisation boundary.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getString(
  args: Record<string, unknown>,
  key: string
): string | undefined {
  const value = args[key];
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getRequiredString(
  args: Record<string, unknown>,
  key: string
): string {
  const value = getString(args, key);
  if (value === undefined) {
    throw new ToolArgumentError(`Missing required parameter "${key}".`);
  }
  return value;
}

export function getEmail(
  args: Record<string, unknown>,
  key: string
): string | undefined {
  const value = getString(args, key);
  if (value === undefined) {
    return undefined;
  }
  if (!EMAIL_PATTERN.test(value)) {
    throw new ToolArgumentError(`"${key}" must be a valid email address.`);
  }
  return value.toLowerCase();
}

export function getRequiredEmail(
  args: Record<string, unknown>,
  key: string
): string {
  const value = getEmail(args, key);
  if (value === undefined) {
    throw new ToolArgumentError(`Missing required email parameter "${key}".`);
  }
  return value;
}

export function getEmailList(
  args: Record<string, unknown>,
  key: string
): string[] {
  const value = args[key];
  if (value === undefined || value === null) {
    return [];
  }

  const rawList = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(/[,\s]+/)
      : [];

  const emails: string[] = [];
  for (const entry of rawList) {
    if (typeof entry !== "string") {
      continue;
    }
    const trimmed = entry.trim().toLowerCase();
    if (trimmed.length === 0) {
      continue;
    }
    if (!EMAIL_PATTERN.test(trimmed)) {
      throw new ToolArgumentError(`"${trimmed}" is not a valid email address.`);
    }
    if (!emails.includes(trimmed)) {
      emails.push(trimmed);
    }
  }

  return emails;
}

/**
 * Resolves a model-provided date-time string to a valid ISO string.
 * Accepts anything `Date.parse` understands and re-emits a canonical ISO
 * value so downstream Google APIs receive well-formed input.
 */
export function getIsoDateTime(
  args: Record<string, unknown>,
  key: string
): string | undefined {
  const value = getString(args, key);
  if (value === undefined) {
    return undefined;
  }
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new ToolArgumentError(
      `"${key}" must be a valid ISO date-time (received "${value}").`
    );
  }
  return new Date(parsed).toISOString();
}

export function getRequiredIsoDateTime(
  args: Record<string, unknown>,
  key: string
): string {
  const value = getIsoDateTime(args, key);
  if (value === undefined) {
    throw new ToolArgumentError(`Missing required date-time parameter "${key}".`);
  }
  return value;
}

/**
 * Thrown when model-generated arguments fail validation. The agent loop
 * catches this and feeds the message back to the model so it can correct
 * itself, rather than surfacing an internal error to the user.
 */
export class ToolArgumentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolArgumentError";
  }
}
