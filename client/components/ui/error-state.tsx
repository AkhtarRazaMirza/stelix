interface ErrorStateProps {
  message: string;
}

export function ErrorState({
  message,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
      <p className="text-red-400">
        {message}
      </p>
    </div>
  );
}