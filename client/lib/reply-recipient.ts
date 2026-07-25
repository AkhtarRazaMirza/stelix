/**
 * Converts a mailbox header returned by Gmail into the address expected by the
 * compose recipient field. This is intentionally used only for Reply; compose
 * continues to validate exactly what a user enters.
 */
export function normalizeReplyRecipient(from: string): string {
  let inQuotedString = false;
  let escaped = false;
  let addressStart = -1;
  let address = "";

  for (let index = 0; index < from.length; index += 1) {
    const character = from[index];

    if (inQuotedString) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === '"') {
        inQuotedString = false;
      }
      continue;
    }

    if (character === '"') {
      inQuotedString = true;
    } else if (character === "<") {
      addressStart = index + 1;
    } else if (character === ">" && addressStart !== -1) {
      address = from.slice(addressStart, index).trim();
      addressStart = -1;
    }
  }

  return address || from.trim();
}
