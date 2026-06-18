import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface CommandCenterEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
  compact?: boolean;
}

export function CommandCenterEmptyState({
  icon: Icon,
  title,
  description,
  children,
  compact = false,
}: CommandCenterEmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 text-center ${
        compact ? "p-6" : "p-10"
      }`}
    >
      {Icon && (
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
          <Icon className="h-5 w-5 text-zinc-500" />
        </div>
      )}

      <h3 className="text-sm font-semibold text-white">{title}</h3>

      <p className="mt-1 max-w-xs text-sm text-zinc-500">{description}</p>

      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
