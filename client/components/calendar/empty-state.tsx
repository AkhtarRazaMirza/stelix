import type { ReactNode } from "react";

interface CalendarEmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function CalendarEmptyState({
  title,
  description,
  children,
}: CalendarEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>

      <p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
