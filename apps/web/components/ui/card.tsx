import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils/cn";

interface CardProps extends PropsWithChildren {
  className?: string;
}

export function Card({ children, className }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] p-5 shadow-[var(--shadow-xs)]",
        className
      )}
    >
      {children}
    </div>
  );
}
