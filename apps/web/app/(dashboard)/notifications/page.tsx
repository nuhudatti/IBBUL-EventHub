"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { Route } from "next";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { requestApi } from "@/lib/api/client";
import { useToast } from "@/components/ux/toast-provider";

type Notif = {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data: { eventId?: string; status?: string } | null;
};

type NotifList = {
  items: Notif[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

function priorityForType(type: string): "high" | "medium" | "low" {
  if (type === "CONFLICT_DETECTED" || type === "SYSTEM_ALERT") return "high";
  if (type === "EVENT_CREATED" || type === "EVENT_REJECTED") return "medium";
  return "low";
}

function entityLink(data: Notif["data"]): string | null {
  if (data?.eventId) return `/events`;
  return null;
}

export default function NotificationsPage(): JSX.Element {
  const { status } = useSession();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => requestApi<NotifList>("/api/v1/notifications?page=1&limit=50"),
    enabled: status === "authenticated"
  });

  const markAll = useMutation({
    mutationFn: () => requestApi<{ updated: number }>("/api/v1/notifications/mark-all-read", { method: "POST" }),
    onSuccess: (res) => {
      void refetch();
      pushToast({ variant: "success", title: `Marked ${res.updated} notification(s) read` });
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Failed" });
    }
  });

  const markOne = useMutation({
    mutationFn: (id: string) =>
      requestApi<unknown>(`/api/v1/notifications/${id}`, { method: "PATCH", body: JSON.stringify({ read: true }) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Failed" });
    }
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Operational signals: approvals, conflicts, and system alerts. High-priority items are highlighted."
        rightSlot={
          <Button size="sm" variant="outline" onClick={() => markAll.mutate()} disabled={markAll.isPending} type="button">
            Mark all read
          </Button>
        }
      />
      <Card className="p-0">
        {isLoading ? <Skeleton className="m-4 h-12 w-full" /> : null}
        <div className="divide-y divide-[hsl(var(--color-border))]">
          {data?.items.map((item) => {
            const pr = priorityForType(item.type);
            const borderClass =
              pr === "high"
                ? "border-l-4 border-l-[hsl(var(--color-danger))]"
                : pr === "medium"
                  ? "border-l-4 border-l-[hsl(var(--color-warning))]"
                  : "border-l-4 border-l-transparent";
            return (
              <div
                key={item.id}
                className={`flex items-start justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-[hsl(var(--color-panel-muted))]/50 ${borderClass} ${
                  item.isRead ? "opacity-75" : "bg-[hsl(var(--color-primary-soft))]/20"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[hsl(var(--color-text))]">{item.title}</p>
                  <p className="mt-1 text-sm text-[hsl(var(--color-text-muted))]">{item.body}</p>
                  <p className="mt-1 text-xs text-[hsl(var(--color-text-muted))]">
                    {item.createdAt ? format(parseISO(item.createdAt), "PPpp") : ""}
                  </p>
                  {entityLink(item.data) ? (
                    <Link
                      href={(entityLink(item.data) ?? "/events") as Route}
                      className="mt-2 inline-block text-xs font-medium text-[hsl(var(--color-primary))] hover:underline"
                    >
                      Open related →
                    </Link>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Badge variant={pr === "high" ? "danger" : pr === "medium" ? "warning" : "neutral"}>
                    {item.type.replaceAll("_", " ")}
                  </Badge>
                  {!item.isRead ? (
                    <Button type="button" size="sm" variant="outline" onClick={() => markOne.mutate(item.id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
        {!isLoading && !data?.items.length ? (
          <p className="p-6 text-sm text-[hsl(var(--color-text-muted))]">You are all caught up.</p>
        ) : null}
      </Card>
    </div>
  );
}
