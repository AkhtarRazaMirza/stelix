import { describe, expect, it } from "vitest";

import { normalizeReplyRecipient } from "../../../client/lib/reply-recipient";
import { sendEmailSchema } from "../validations/gmail.validation.js";

describe("normalizeReplyRecipient", () => {
  it.each([
    ["John Doe <john@example.com>", "john@example.com"],
    ['"John Doe" <john@example.com>', "john@example.com"],
    ["john@example.com", "john@example.com"],
    ["John Q. Doe <john+reply@sub.example.co.uk>", "john+reply@sub.example.co.uk"],
    ['"Doe, John <External>" <john@example.com>', "john@example.com"],
    ["<john@example.com>", "john@example.com"],
  ])("extracts the mailbox from %s", (from, expected) => {
    expect(normalizeReplyRecipient(from)).toBe(expected);
  });
});

describe("sendEmailSchema", () => {
  const message = { subject: "Re: Hello", body: "Thanks" };

  it("accepts the normalized reply recipient", () => {
    expect(
      sendEmailSchema.safeParse({ ...message, to: "john@example.com" }).success
    ).toBe(true);
  });

  it("continues to reject an invalid recipient", () => {
    expect(
      sendEmailSchema.safeParse({ ...message, to: "John Doe <john@example.com>" })
        .success
    ).toBe(false);
  });
});
