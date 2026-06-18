interface CalendarErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function CalendarErrorState({
  title,
  description,
  onRetry,
}: CalendarErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
      <h3 className="text-base font-semibold text-red-400">{title}</h3>

      <p className="mt-2 text-sm text-zinc-300">{description}</p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
        >
          Try again
        </button>
      )}
    </div>
  );
}
