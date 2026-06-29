import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[hsl(var(--color-primary))] text-white hover:brightness-95 active:brightness-90",
  secondary:
    "bg-[hsl(var(--color-panel-muted))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-panel-muted)/0.9)]",
  outline:
    "border border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-panel))] text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-panel-muted))]",
  ghost:
    "text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-panel-muted))] hover:text-[hsl(var(--color-text))]",
  danger: "bg-[hsl(var(--color-danger))] text-white hover:brightness-95 active:brightness-90"
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm"
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium transition-all duration-[var(--motion-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary))] disabled:cursor-not-allowed disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
