export function TypingIndicator() {
  return (
    <div
      className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3"
      aria-label="Stelix is thinking"
      role="status"
    >
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.3s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:-0.15s]" />
      <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" />
    </div>
  );
}
