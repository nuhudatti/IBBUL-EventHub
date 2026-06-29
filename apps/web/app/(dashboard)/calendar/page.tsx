"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Layers } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CalendarBoard = dynamic(
  () => import("@/components/calendar/calendar-board").then((m) => m.CalendarBoard),
  { ssr: false, loading: () => <Skeleton className="h-[580px] w-full rounded-lg" /> }
);

export default function CalendarPage(): JSX.Element {
  const exportFnRef = useRef<() => void>(() => {});

  const onRegisterExport = useCallback((fn: () => void) => {
    exportFnRef.current = fn;
  }, []);

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="Events in the visible month or week are loaded from the server. Colored border: status. Ring: venue conflict. Export downloads the current range as .ics."
        rightSlot={
          <Button variant="outline" type="button" onClick={() => exportFnRef.current()}>
            Export iCal
          </Button>
        }
      />
      <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-[hsl(var(--color-text-muted))]">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded border-l-2 border-l-emerald-500" aria-hidden />
          Approved
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded border-l-2 border-l-amber-500" aria-hidden />
          Pending
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-flex h-2.5 w-2.5 items-center justify-center ring-1 ring-amber-400/50" aria-hidden />
          <Layers className="h-3.5 w-3.5" />
          Overlap / conflict
        </span>
      </div>
      <CalendarBoard onRegisterExport={onRegisterExport} />
    </div>
  );
}
