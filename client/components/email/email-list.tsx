"use client";

import { useState } from "react";

import { Email } from "@/types/email";
import { EmailItem } from "./email-item";

interface EmailListProps {
  emails: Email[];
}

export function EmailList({
  emails,
}: EmailListProps) {
  const [search, setSearch] =
    useState("");

  const filteredEmails =
    emails.filter(
      (email) =>
        email.subject
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        email.from
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Search emails..."
        value={search}
        onChange={(e) =>
          setSearch(
            e.target.value
          )
        }
        className="w-full rounded-xl border border-white/10 bg-[#111111] px-4 py-3 text-sm outline-none placeholder:text-zinc-500 focus:border-white/20"
      />

      <div className="space-y-3">
        {filteredEmails.map(
          (email) => (
            <EmailItem
              key={email.id}
              email={email}
            />
          )
        )}
      </div>
    </div>
  );
}