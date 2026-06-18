interface ErrorStateProps {
  title: string;
  description: string;
}

export function ErrorState({
  title,
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
      <h3 className="text-lg font-semibold text-red-400">
        {title}
      </h3>

      <p className="mt-2 text-zinc-300">
        {description}
      </p>
    </div>
  );
}