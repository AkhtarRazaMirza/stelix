interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

export function ErrorState({
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
      <h3 className="text-lg font-semibold text-red-400">
        {title}
      </h3>

      <p className="mt-2 text-zinc-300">
        {description}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-lg border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
        >
          Try Again
        </button>
      )}
    </div>
  );
}