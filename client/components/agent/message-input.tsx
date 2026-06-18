"use client";

import { useState } from "react";
import { ArrowUp, Loader2 } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  disabled,
  placeholder = "Ask Stelix to help...",
}: MessageInputProps) {
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) {
      return;
    }
    onSend(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-black px-3 py-2 transition focus-within:border-white/25"
    >
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Message Stelix"
        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
      />

      <button
        type="submit"
        disabled={disabled || value.trim().length === 0}
        aria-label="Send message"
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black transition hover:bg-zinc-200 disabled:opacity-40"
      >
        {disabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ArrowUp className="h-4 w-4" />
        )}
      </button>
    </form>
  );
}
