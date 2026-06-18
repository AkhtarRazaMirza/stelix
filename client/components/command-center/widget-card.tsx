import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface WidgetCardProps {
  title: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function WidgetCard({
  title,
  icon: Icon,
  badge,
  action,
  children,
  className = "",
  contentClassName = "",
}: WidgetCardProps) {
  return (
    <section
      className={`flex flex-col rounded-2xl border border-white/10 bg-[#111111] ${className}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-300">
              <Icon className="h-3.5 w-3.5" />
            </span>
          )}

          <h3 className="text-sm font-semibold text-white">{title}</h3>

          {badge}
        </div>

        {action}
      </header>

      <div className={`flex-1 ${contentClassName}`}>{children}</div>
    </section>
  );
}
