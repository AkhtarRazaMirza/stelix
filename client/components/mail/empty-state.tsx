import type { ReactNode } from "react";

interface MailEmptyStateProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function MailEmptyState({
  title,
  description,
  children,
}: MailEmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
      <h3 className="text-base font-semibold text-white">{title}</h3>

      <p className="mt-2 max-w-sm text-sm text-zinc-400">{description}</p>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
