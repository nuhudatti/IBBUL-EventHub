import { cn } from "@/lib/utils/cn";

export function PageHeader({
  title,
  description,
  rightSlot,
  className
}: {
  title: string;
  description?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}): JSX.Element {
  return (
    <div className={cn("mb-6 flex items-start justify-between gap-4", className)}>
      <div>
        <h1>{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-[hsl(var(--color-text-muted))]">{description}</p>
        ) : null}
      </div>
      {rightSlot}
    </div>
  );
}
