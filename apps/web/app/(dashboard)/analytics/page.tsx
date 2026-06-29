"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requestApi } from "@/lib/api/client";
import { hasAnyRole, type AppRole } from "@/lib/auth/rbac";

type AnalyticsPayload = {
  eventsOverTime: Array<{ weekStart: string; weekEnd: string; count: number }>;
  departmentActivity: Array<{ id: string; name: string; eventCount: number }>;
  venueUtilization: Array<{ id: string; name: string; sharePercent: number; eventCount: number }>;
  peakBookingHoursUtc: Array<{ hour: number; count: number }>;
};

export default function AnalyticsPage(): JSX.Element {
  const { data: session, status } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const allowed = Boolean(role && hasAnyRole(role, ["SUPER_ADMIN", "ADMIN"]));

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["analytics"],
    queryFn: () => requestApi<AnalyticsPayload>("/api/v1/analytics"),
    enabled: status === "authenticated" && allowed
  });

  if (!allowed) {
    return (
      <div>
        <PageHeader title="Analytics" description="Administrators can view organization analytics." />
        <Card className="p-6 text-sm text-[hsl(var(--color-text-muted))]">You do not have access to this area.</Card>
      </div>
    );
  }

  const peakData =
    data?.peakBookingHoursUtc.map((row) => ({
      label: `${String(row.hour).padStart(2, "0")}:00`,
      events: row.count
    })) ?? [];

  const deptChart = data?.departmentActivity.filter((d) => d.eventCount > 0).slice(0, 8) ?? [];

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Live aggregates for admins."
      />
      {isError ? (
        <p className="mb-4 text-sm text-[hsl(var(--color-danger))]" role="alert">
          {error instanceof Error ? error.message : "Failed to load analytics"}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="p-4">
          <h2 className="text-base font-semibold">Events over time (created)</h2>
          <p className="mt-1 text-xs text-[hsl(var(--color-text-muted))]">Weekly buckets, last 12 weeks</p>
          {isLoading ? <Skeleton className="mt-4 h-56 w-full" /> : null}
          {!isLoading && data ? (
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.eventsOverTime.map((w) => ({ label: format(parseISO(w.weekStart), "MMM d"), count: w.count }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="hsl(var(--color-text-muted))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--color-text-muted))" />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="count" stroke="hsl(var(--color-primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </Card>
        <Card className="p-4">
          <h2 className="text-base font-semibold">Department activity</h2>
          <p className="mt-1 text-xs text-[hsl(var(--color-text-muted))]">Events created in range, by department</p>
          {isLoading ? <Skeleton className="mt-4 h-56 w-full" /> : null}
          {!isLoading && data ? (
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptChart.map((d) => ({ name: d.name.slice(0, 14), events: d.eventCount }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--color-text-muted))" />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--color-text-muted))" />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="events" fill="hsl(var(--color-primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </Card>
        <Card className="p-4">
          <h2 className="text-base font-semibold">Venue share of events</h2>
          <p className="mt-1 text-xs text-[hsl(var(--color-text-muted))]">Percent of booked events in period (by count)</p>
          {isLoading ? <Skeleton className="mt-4 h-56 w-full" /> : null}
          {!isLoading && data ? (
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.venueUtilization.slice(0, 8).map((v) => ({ name: v.name.slice(0, 12), pct: v.sharePercent }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--color-text-muted))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--color-text-muted))" domain={[0, 100]} />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="pct" fill="hsl(var(--color-success))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </Card>
        <Card className="p-4">
          <h2 className="text-base font-semibold">Peak booking hours (UTC)</h2>
          <p className="mt-1 text-xs text-[hsl(var(--color-text-muted))]">Approved & pending starts (26w)</p>
          {isLoading ? <Skeleton className="mt-4 h-56 w-full" /> : null}
          {!isLoading && data ? (
            <div className="mt-4 h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peakData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} stroke="hsl(var(--color-text-muted))" interval={2} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} stroke="hsl(var(--color-text-muted))" />
                  <Tooltip contentStyle={{ fontSize: 12 }} />
                  <Bar dataKey="events" fill="hsl(var(--color-info))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
