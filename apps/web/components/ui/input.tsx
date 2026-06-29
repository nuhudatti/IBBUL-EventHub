import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "h-10 w-full rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-3 text-sm text-[hsl(var(--color-text))] transition-all duration-[var(--motion-fast)] placeholder:text-[hsl(var(--color-text-muted))] focus-visible:border-[hsl(var(--color-primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-primary)/0.2)]",
          className
        )}
        {...props}
      />
    );
  }
);
