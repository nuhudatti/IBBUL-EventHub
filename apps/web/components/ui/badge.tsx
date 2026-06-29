import { cn } from "@/lib/utils/cn";

type BadgeVariant = "neutral" | "primary" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  neutral:
    "border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-muted))] text-[hsl(var(--color-text-muted))]",
  primary:
    "border-[hsl(var(--color-primary)/0.2)] bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary))]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-rose-200 bg-rose-50 text-rose-700"
};

export function Badge({
  children,
  variant = "neutral",
  className
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}): JSX.Element {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
