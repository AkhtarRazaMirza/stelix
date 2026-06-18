import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function EmptyState({
  title,
  description,
  children,
}: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-10 text-center">
      <h3 className="text-lg font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-zinc-400">
        {description}
      </p>

      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );
}