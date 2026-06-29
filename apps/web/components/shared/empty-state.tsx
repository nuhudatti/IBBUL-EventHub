import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  ctaLabel
}: {
  title: string;
  description: string;
  ctaLabel?: string;
}): JSX.Element {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-panel))] px-6 py-10 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--color-primary-soft))]">
        <Sparkles className="h-5 w-5 text-[hsl(var(--color-primary))]" />
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-[hsl(var(--color-text-muted))]">{description}</p>
      {ctaLabel ? (
        <Button className="mt-5" size="sm">
          {ctaLabel}
        </Button>
      ) : null}
    </div>
  );
}
