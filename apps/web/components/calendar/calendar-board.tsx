"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DatesSetArg, EventInput } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ux/toast-provider";
import { requestApi } from "@/lib/api/client";
import { buildIcs, downloadIcsFile, type IcsEvent } from "@/lib/calendar/ical";

type CalendarEventRow = {
  id: string;
  title: string;
  start: string;
  end: string;
  status: string;
  venueName: string | null;
  conflictPartner: { id: string; title: string } | null;
};

type CalendarResponse = { events: CalendarEventRow[] };

const statusClass: Record<string, string> = {
  APPROVED: "border-l-emerald-500",
  PENDING: "border-l-amber-500",
  DRAFT: "border-l-slate-400",
  REJECTED: "border-l-rose-500",
  CANCELLED: "border-l-zinc-500"
};

export type CalendarBoardProps = {
  onRegisterExport: (fn: () => void) => void;
};

export function CalendarBoard({ onRegisterExport }: CalendarBoardProps) {
  const { status: sessionStatus } = useSession();
  const { pushToast } = useToast();
  const [fcEvents, setFcEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);
  const lastLoadedRef = useRef<IcsEvent[]>([]);
  const visibleRangeRef = useRef<{ start: Date; end: Date } | null>(null);

  const loadRange = useCallback(
    async (start: Date, end: Date) => {
      if (sessionStatus !== "authenticated") {
        return;
      }
      const qs = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString()
      });
      setLoading(true);
      try {
        const data = await requestApi<CalendarResponse>(`/api/v1/events/calendar?${qs.toString()}`);
        const ics: IcsEvent[] = data.events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          location: e.venueName
        }));
        lastLoadedRef.current = ics;
        setFcEvents(
          data.events.map((e) => {
            const conflict = e.conflictPartner
              ? ` — conflict w/ “${e.conflictPartner.title}”`
              : "";
            return {
              id: e.id,
              title: e.title + (e.status === "PENDING" ? " (pending)" : "") + conflict,
              start: e.start,
              end: e.end,
              classNames: [
                statusClass[e.status] ?? "border-l-slate-400",
                "border-l-2",
                e.conflictPartner ? "ring-1 ring-amber-400/50" : ""
              ].filter(Boolean),
              extendedProps: {
                venueName: e.venueName,
                status: e.status,
                conflict: e.conflictPartner
              }
            };
          })
        );
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Failed to load calendar.";
        pushToast({ title: "Calendar", description: msg, variant: "error" });
        setFcEvents([]);
        lastLoadedRef.current = [];
      } finally {
        setLoading(false);
      }
    },
    [sessionStatus, pushToast]
  );

  const handleDatesSet = useCallback(
    (arg: DatesSetArg) => {
      visibleRangeRef.current = { start: arg.start, end: arg.end };
      void loadRange(arg.start, arg.end);
    },
    [loadRange]
  );

  const prevSessionStatusRef = useRef<string | null>(null);
  /** Re-fetch once when auth finishes after the first `datesSet` (early no-op). */
  useEffect(() => {
    const prev = prevSessionStatusRef.current;
    prevSessionStatusRef.current = sessionStatus;
    if (prev === "loading" && sessionStatus === "authenticated" && visibleRangeRef.current) {
      void loadRange(visibleRangeRef.current.start, visibleRangeRef.current.end);
    }
  }, [sessionStatus, loadRange]);

  const runExport = useCallback(() => {
    const events = lastLoadedRef.current;
    if (events.length === 0) {
      pushToast({
        title: "Export",
        description: "No events in the current range to export.",
        variant: "error"
      });
      return;
    }
    const ics = buildIcs("Campus events", events);
    downloadIcsFile("campus-events.ics", ics);
  }, [pushToast]);

  useLayoutEffect(() => {
    onRegisterExport(runExport);
  }, [onRegisterExport, runExport]);

  return (
    <Card className="p-3 md:p-4">
      <div className="relative">
        {loading ? (
          <div
            className="pointer-events-none absolute right-2 top-2 z-10 rounded bg-[hsl(var(--color-panel))]/90 px-2 py-1 text-xs text-[hsl(var(--color-text-muted))]"
            aria-hidden
          >
            Loading…
          </div>
        ) : null}
        <div className="min-h-[560px] overflow-hidden rounded-[var(--radius-md)] [&_.fc]:text-[hsl(var(--color-text))] [&_.fc-button]:bg-[hsl(var(--color-panel))] [&_.fc-button]:text-[hsl(var(--color-text))]">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            height="auto"
            editable={false}
            dayMaxEvents
            weekends
            events={fcEvents}
            datesSet={handleDatesSet}
            eventDidMount={(info) => {
              const v = info.event.extendedProps as { venueName?: string | null; status?: string };
              const bits = [v.status, v.venueName].filter(Boolean).join(" · ");
              if (bits) {
                info.el.setAttribute("title", bits);
              }
            }}
          />
        </div>
      </div>
    </Card>
  );
}
