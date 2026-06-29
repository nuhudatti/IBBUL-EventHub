import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }): JSX.Element {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[var(--radius-sm)] bg-[hsl(var(--color-panel-muted))]",
        className
      )}
    />
  );
}
