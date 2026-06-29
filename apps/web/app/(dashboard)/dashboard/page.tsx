"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Route } from "next";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requestApi } from "@/lib/api/client";
import { hasAnyRole, type AppRole } from "@/lib/auth/rbac";

type EventListItem = {
  id: string;
  title: string;
  status: string;
  startTime: string;
  endTime: string;
  venue: { name: string } | null;
};

type ListResponse = { items: EventListItem[]; meta: { total: number; page: number; totalPages: number } };

type DashboardSummary = {
  role: AppRole;
  alerts: {
    unresolvedConflicts: number;
    pendingApprovals: number;
    suspendedUsers: number;
    systemWarnings: string[];
  };
  insights: {
    peakBookingHour: { hour: number; label: string; eventCount: number } | null;
    overUtilizedVenue: { venueId: string; name: string; score: number; bookingCount: number } | null;
    inactiveDepartments: Array<{ id: string; name: string }>;
  };
  kpis: {
    totalEvents: number;
    approvedUpcoming: number;
    eventsThisMonth: number;
  };
};

export default function DashboardPage(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const isSuperAdmin = role === "SUPER_ADMIN";
  const canSeePending = role && hasAnyRole(role, ["APPROVER", "ADMIN", "SUPER_ADMIN"]);
  const fullOps = role && hasAnyRole(role, ["APPROVER", "ADMIN", "SUPER_ADMIN"]);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => requestApi<DashboardSummary>("/api/v1/dashboard/summary"),
    enabled: sessionStatus === "authenticated" && Boolean(role)
  });

  const { data: allEvents, isLoading: loadAll } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: () => requestApi<ListResponse>("/api/v1/events?limit=8&page=1"),
    enabled: sessionStatus === "authenticated" && Boolean(role)
  });

  const { data: pending, isLoading: loadPending } = useQuery({
    queryKey: ["pending-events"],
    queryFn: () => requestApi<EventListItem[]>(`/api/v1/events/pending`),
    enabled: sessionStatus === "authenticated" && Boolean(canSeePending)
  });

  const isViewer = role === "VIEWER";

  return (
    <div>
      <PageHeader
        title={isSuperAdmin ? "Control center" : "Dashboard"}
        description={
          isViewer ? "Approved events only." : isSuperAdmin ? "Alerts, KPIs, and quick links." : "Ops snapshot and pending queue."
        }
      />

      {fullOps ? (
        <section className="mb-4 grid gap-3 lg:grid-cols-3">
          {summaryLoading ? (
            <>
              <Skeleton className="h-28 w-full rounded-[var(--radius-md)]" />
              <Skeleton className="h-28 w-full rounded-[var(--radius-md)]" />
              <Skeleton className="h-28 w-full rounded-[var(--radius-md)]" />
            </>
          ) : summary ? (
            <>
              <Card className="border-l-4 border-l-[hsl(var(--color-danger))] p-4 shadow-[var(--shadow-xs)] transition-[border-color,box-shadow] duration-150 hover:shadow-[var(--shadow-sm)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--color-text-muted))]">Priority alerts</p>
                <ul className="mt-2 space-y-1.5 text-sm">
                  <li className="flex justify-between gap-2">
                    <span>Unresolved conflicts</span>
                    <Badge variant={summary.alerts.unresolvedConflicts > 0 ? "danger" : "neutral"}>
                      {summary.alerts.unresolvedConflicts}
                    </Badge>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Pending approvals</span>
                    <Badge variant={summary.alerts.pendingApprovals > 0 ? "warning" : "neutral"}>
                      {summary.alerts.pendingApprovals}
                    </Badge>
                  </li>
                  <li className="flex justify-between gap-2">
                    <span>Suspended accounts</span>
                    <Badge variant={summary.alerts.suspendedUsers > 0 ? "warning" : "neutral"}>
                      {summary.alerts.suspendedUsers}
                    </Badge>
                  </li>
                </ul>
                {summary.alerts.systemWarnings.length ? (
                  <ul className="mt-3 space-y-1 border-t border-[hsl(var(--color-border))] pt-3 text-xs text-[hsl(var(--color-danger))]">
                    {summary.alerts.systemWarnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                ) : null}
              </Card>
              <Card className="p-4 shadow-[var(--shadow-xs)] transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--color-text-muted))]">Insights</p>
                <ul className="mt-2 space-y-2 text-sm text-[hsl(var(--color-text))]">
                  <li>
                    <span className="text-[hsl(var(--color-text-muted))]">Peak booking: </span>
                    {summary.insights.peakBookingHour
                      ? `${summary.insights.peakBookingHour.label} (${summary.insights.peakBookingHour.eventCount} events / 90d)`
                      : "Not enough signal yet."}
                  </li>
                  <li>
                    <span className="text-[hsl(var(--color-text-muted))]">Venue load: </span>
                    {summary.insights.overUtilizedVenue
                      ? `${summary.insights.overUtilizedVenue.name} · score ${summary.insights.overUtilizedVenue.score}`
                      : "No venue stands out."}
                  </li>
                  <li>
                    <span className="text-[hsl(var(--color-text-muted))]">Inactive departments: </span>
                    {summary.insights.inactiveDepartments.length
                      ? summary.insights.inactiveDepartments.map((d) => d.name).join(", ")
                      : "All departments have recent activity."}
                  </li>
                </ul>
              </Card>
              <Card className="p-4 shadow-[var(--shadow-xs)]">
                <p className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--color-text-muted))]">Quick actions</p>
                <div className="mt-3 flex flex-col gap-2">
                  <Link
                    href={"/events?status=PENDING" as Route}
                    className="inline-flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] bg-[hsl(var(--color-primary))] px-3 text-xs font-medium text-white hover:brightness-95"
                  >
                    Review pending
                  </Link>
                  <Link
                    href={"/events?conflict=1" as Route}
                    className="inline-flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-panel))] px-3 text-xs font-medium hover:bg-[hsl(var(--color-panel-muted))]"
                  >
                    Jump to conflicts
                  </Link>
                  <Link
                    href={"/events" as Route}
                    className="inline-flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-panel))] px-3 text-xs font-medium hover:bg-[hsl(var(--color-panel-muted))]"
                  >
                    Events
                  </Link>
                  {isSuperAdmin ? (
                    <Link
                      href={"/users" as Route}
                      className="inline-flex h-8 w-full items-center justify-center rounded-[var(--radius-sm)] border border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-panel))] px-3 text-xs font-medium hover:bg-[hsl(var(--color-panel-muted))]"
                    >
                      Users
                    </Link>
                  ) : null}
                </div>
              </Card>
            </>
          ) : null}
        </section>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {loadAll || summaryLoading ? (
          <>
            <Card className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
            <Card className="p-4">
              <Skeleton className="h-16 w-full" />
            </Card>
          </>
        ) : null}
        {!loadAll && summary ? (
          <>
            <Card className="p-4 transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]">
              <p className="text-sm text-[hsl(var(--color-text-muted))]">Total events</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.kpis.totalEvents}</p>
              <Badge className="mt-2" variant="neutral">
                Org-wide
              </Badge>
            </Card>
            <Card className="p-4 transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]">
              <p className="text-sm text-[hsl(var(--color-text-muted))]">Approved upcoming</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.kpis.approvedUpcoming}</p>
              <Badge className="mt-2" variant="success">
                On calendar
              </Badge>
            </Card>
            <Card className="p-4 transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]">
              <p className="text-sm text-[hsl(var(--color-text-muted))]">New this month</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">{summary.kpis.eventsThisMonth}</p>
              <Badge className="mt-2" variant="primary">
                Created
              </Badge>
            </Card>
          </>
        ) : null}
        {!loadAll && !summary ? (
          <Card className="p-4">
            <p className="text-sm text-[hsl(var(--color-text-muted))]">Signed in as</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{session?.user?.name ?? "—"}</p>
            <Badge className="mt-2" variant="primary">
              {role ?? "—"}
            </Badge>
          </Card>
        ) : null}
        {canSeePending ? (
          <Card className="p-4 md:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Pending approvals</h2>
              <Link
                href={"/events" as Route}
                className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] border border-[hsl(var(--color-border-strong))] bg-[hsl(var(--color-panel))] px-3 text-xs font-medium hover:bg-[hsl(var(--color-panel-muted))]"
              >
                Open events
              </Link>
            </div>
            {loadPending ? <Skeleton className="mt-4 h-10 w-full" /> : null}
            {!loadPending && pending && pending.length === 0 ? (
              <p className="mt-3 text-sm text-[hsl(var(--color-text-muted))]">No pending events.</p>
            ) : null}
            {!loadPending && pending
              ? pending.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    className="mt-2 flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] px-3 py-2 text-sm transition-colors duration-150 hover:border-[hsl(var(--color-border-strong))]"
                  >
                    <span className="font-medium">{e.title}</span>
                    <span className="text-xs text-[hsl(var(--color-text-muted))]">
                      {e.startTime ? format(parseISO(e.startTime), "PPp") : "—"}
                    </span>
                  </div>
                ))
              : null}
          </Card>
        ) : null}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[2fr_1fr]">
        <Card className="p-4">
          <h2 className="text-base font-semibold">Upcoming schedule</h2>
          {loadAll ? <Skeleton className="mt-4 h-10 w-full" /> : null}
          {!loadAll && allEvents?.items?.length
            ? allEvents.items.map((e) => (
                <div
                  key={e.id}
                  className="mt-2 flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] px-3 py-2 transition-colors duration-150 hover:border-[hsl(var(--color-border-strong))]"
                >
                  <span className="text-sm font-medium">{e.title}</span>
                  <span className="text-xs text-[hsl(var(--color-text-muted))]">{e.venue?.name ?? "—"}</span>
                </div>
              ))
            : null}
          {!loadAll && !allEvents?.items?.length ? (
            <p className="mt-3 text-sm text-[hsl(var(--color-text-muted))]">No upcoming rows in this sample.</p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}
