import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-xl
        border
        border-white/10
        bg-[#111111]
        p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}