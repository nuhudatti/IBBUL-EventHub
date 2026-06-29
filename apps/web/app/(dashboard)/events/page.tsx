"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useToast } from "@/components/ux/toast-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { requestApi, requestApiWithMessage } from "@/lib/api/client";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";

type EventStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

type EventListItem = {
  id: string;
  title: string;
  status: EventStatus;
  type: string;
  startTime: string;
  endTime: string;
  venue: { id: string; name: string; code: string } | null;
  organizer: { id: string; name: string; email: string | null } | null;
  conflictPartner?: { id: string; title: string } | null;
};

type ListResponse = {
  items: EventListItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};

type DepartmentOption = {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  children?: Array<{ id: string; name: string; slug: string }>;
};
type VenueOption = { id: string; name: string; code: string };
type CategoryOption = { id: string; name: string; slug: string };

type CreateEventResponse = {
  id: string;
  title: string;
  hasConflict?: boolean;
  conflictingTitle?: string | null;
};

type StatusFilterChip = "All" | EventStatus | "CONFLICT";

const STATUS_FILTER_CHIPS: StatusFilterChip[] = [
  "All",
  "PENDING",
  "APPROVED",
  "DRAFT",
  "REJECTED",
  "CANCELLED",
  "CONFLICT"
];

function statusVariant(status: EventStatus): "success" | "warning" | "danger" | "neutral" {
  if (status === "APPROVED") return "success";
  if (status === "PENDING") return "warning";
  if (status === "REJECTED" || status === "CANCELLED") return "danger";
  return "neutral";
}

function buildListUrl(page: number, search: string, statusChip: StatusFilterChip): string {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", "25");
  if (search.trim()) params.set("search", search.trim());
  if (statusChip === "CONFLICT") params.set("conflict", "1");
  else if (statusChip !== "All") params.set("status", statusChip);
  return `/api/v1/events?${params.toString()}`;
}

export default function EventsPage(): JSX.Element {
  const { data: session, status: sessionStatus } = useSession();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const role = session?.user?.role as AppRole | undefined;

  const isViewer = role === "VIEWER";
  const canCreate = Boolean(role && canAccess("USER", role));
  const canReview = Boolean(role && hasAnyRole(role, ["APPROVER", "ADMIN", "SUPER_ADMIN"]));
  const canSelectBulk = !isViewer && Boolean(role && canAccess("USER", role));

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState<StatusFilterChip>("All");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    type: "MEETING",
    categoryId: "",
    venueId: "",
    departmentId: "",
    startTime: "",
    endTime: ""
  });

  useEffect(() => {
    const deptId = session?.user?.departmentId;
    if (deptId && !createForm.departmentId) {
      setCreateForm((current) => ({ ...current, departmentId: deptId }));
    }
  }, [session?.user?.departmentId, createForm.departmentId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const st = p.get("status") as EventStatus | null;
    if (st && ["DRAFT", "PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(st)) {
      setActiveStatus(st);
    }
    if (p.get("conflict") === "1") setActiveStatus("CONFLICT");
  }, []);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["events", page, query, activeStatus],
    queryFn: () => requestApi<ListResponse>(buildListUrl(page, query, activeStatus)),
    enabled: sessionStatus === "authenticated"
  });

  const { data: venues } = useQuery({
    queryKey: ["venues-options"],
    queryFn: () => requestApi<VenueOption[]>(`/api/v1/venues`),
    enabled: showCreate && canCreate && sessionStatus === "authenticated"
  });

  const { data: departments } = useQuery({
    queryKey: ["departments-options"],
    queryFn: () => requestApi<DepartmentOption[]>(`/api/v1/departments`),
    enabled: showCreate && canCreate && sessionStatus === "authenticated"
  });

  const { data: categories } = useQuery({
    queryKey: ["event-categories"],
    queryFn: () => requestApi<CategoryOption[]>(`/api/v1/event-categories`),
    enabled: showCreate && canCreate && sessionStatus === "authenticated"
  });

  const departmentOptions = (departments ?? []).flatMap((row) => {
    if (row.parentId) {
      return [{ id: row.id, label: row.parent ? `${row.parent.name} › ${row.name}` : row.name }];
    }
    return (row.children ?? []).map((child) => ({
      id: child.id,
      label: `${row.name} › ${child.name}`
    }));
  });

  const items = data?.items ?? [];

  const invalidateEventQueries = (): void => {
    void queryClient.invalidateQueries({ queryKey: ["events"] });
    void queryClient.invalidateQueries({ queryKey: ["pending-events"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    void queryClient.invalidateQueries({ queryKey: ["calendar-approved"] });
    void queryClient.invalidateQueries({ queryKey: ["calendar-pending"] });
  };

  const bulkApprove = useMutation({
    mutationFn: (ids: string[]) =>
      requestApi<{ succeeded: string[]; failed: Array<{ id: string; message: string }> }>(`/api/v1/events/bulk-approve`, {
        method: "POST",
        body: JSON.stringify({ ids })
      }),
    onSuccess: (res) => {
      invalidateEventQueries();
      setSelectedRows([]);
      pushToast(
        res.failed.length
          ? {
              variant: "warning",
              title: `Approved ${res.succeeded.length} event(s)`,
              description: `${res.failed.length} could not be approved (conflicts or state).`
            }
          : { variant: "success", title: `Approved ${res.succeeded.length} event(s)` }
      );
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Bulk approve failed" });
    }
  });

  const bulkReject = useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      requestApi<{ succeeded: string[]; failed: Array<{ id: string; message: string }> }>(`/api/v1/events/bulk-reject`, {
        method: "POST",
        body: JSON.stringify({ ids, reason })
      }),
    onSuccess: (res) => {
      invalidateEventQueries();
      setSelectedRows([]);
      pushToast(
        res.failed.length
          ? {
              variant: "warning",
              title: `Rejected ${res.succeeded.length} event(s)`,
              description: `${res.failed.length} skipped.`
            }
          : { variant: "success", title: `Rejected ${res.succeeded.length} event(s)` }
      );
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Bulk reject failed" });
    }
  });

  const approve = useMutation({
    mutationFn: (id: string) => requestApi<unknown>(`/api/v1/events/${id}/approve`, { method: "PATCH" }),
    onSuccess: () => {
      invalidateEventQueries();
      pushToast({ variant: "success", title: "Event approved" });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to approve";
      pushToast({ variant: "error", title: message, description: "Time slot may be in conflict with another event." });
    }
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      requestApi<unknown>(`/api/v1/events/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
    onSuccess: () => {
      invalidateEventQueries();
      pushToast({ variant: "success", title: "Event rejected" });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to reject";
      pushToast({ variant: "error", title: message });
    }
  });

  const createEvent = useMutation({
    mutationFn: () =>
      requestApiWithMessage<CreateEventResponse>(`/api/v1/events`, {
        method: "POST",
        body: JSON.stringify({
          title: createForm.title.trim(),
          description: createForm.description.trim(),
          type: createForm.type,
          categoryId: createForm.categoryId || undefined,
          venueId: createForm.venueId,
          departmentId: createForm.departmentId,
          startTime: createForm.startTime,
          endTime: createForm.endTime
        })
      }),
    onSuccess: ({ data, message }) => {
      invalidateEventQueries();
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      setShowCreate(false);
      setCreateForm({
        title: "",
        description: "",
        type: "MEETING",
        categoryId: "",
        venueId: createForm.venueId,
        departmentId: createForm.departmentId,
        startTime: "",
        endTime: ""
      });
      if (data.hasConflict) {
        pushToast({
          variant: "warning",
          title: "Event submitted with conflict",
          description:
            message ??
            (data.conflictingTitle
              ? `This booking overlaps with "${data.conflictingTitle}". Approvers have been notified.`
              : "Venue overlap detected. Approvers have been notified.")
        });
      } else {
        pushToast({ variant: "success", title: message ?? "Event submitted for approval" });
      }
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : "Failed to create event";
      pushToast({ variant: "error", title: message });
    }
  });

  const clearFilters = (): void => {
    setQuery("");
    setActiveStatus("All");
    setPage(1);
    pushToast({ variant: "info", title: "Filters cleared" });
  };

  const pendingSelected = items.filter((row) => selectedRows.includes(row.id) && row.status === "PENDING");

  return (
    <div>
      <PageHeader
        title="Events"
        description={
          isViewer
            ? "Read-only. You only see published (approved) events in your organization."
            : "Create, triage, and schedule with conflict-aware review."
        }
        rightSlot={
          canCreate ? (
            <Button onClick={() => setShowCreate((value) => !value)}>{showCreate ? "Close" : "Create event"}</Button>
          ) : null
        }
      />

      {showCreate && canCreate ? (
        <Card className="mb-4">
          <h2 className="text-base font-semibold">New event</h2>
          <p className="mt-1 text-sm text-[hsl(var(--color-text-muted))]">
            Submissions are routed automatically to your department&apos;s assigned approver. Conflicts are flagged for review.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input value={createForm.title} onChange={(e) => setCreateForm((c) => ({ ...c, title: e.target.value }))} placeholder="Title" />
            </div>
            <div className="md:col-span-2">
              <textarea
                className="min-h-[100px] w-full rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-3 py-2 text-sm"
                value={createForm.description}
                onChange={(e) => setCreateForm((c) => ({ ...c, description: e.target.value }))}
                placeholder="Description (minimum 10 characters)"
              />
            </div>
            <select
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm"
              value={createForm.categoryId}
              onChange={(e) => setCreateForm((c) => ({ ...c, categoryId: e.target.value }))}
            >
              <option value="">Event category (optional)</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm"
              value={createForm.type}
              onChange={(e) => setCreateForm((c) => ({ ...c, type: e.target.value }))}
            >
              {["SEMINAR", "WORKSHOP", "CONFERENCE", "SPORTS", "CULTURAL", "MEETING", "OTHER"].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm"
              value={createForm.venueId}
              onChange={(e) => setCreateForm((c) => ({ ...c, venueId: e.target.value }))}
            >
              <option value="">Select venue</option>
              {venues?.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.code})
                </option>
              ))}
            </select>
            <select
              className="h-10 w-full rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm"
              value={createForm.departmentId}
              onChange={(e) => setCreateForm((c) => ({ ...c, departmentId: e.target.value }))}
            >
              <option value="">Select department</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <Input
              type="datetime-local"
              value={createForm.startTime}
              onChange={(e) => setCreateForm((c) => ({ ...c, startTime: e.target.value }))}
            />
            <Input
              type="datetime-local"
              value={createForm.endTime}
              onChange={(e) => setCreateForm((c) => ({ ...c, endTime: e.target.value }))}
            />
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              onClick={() => {
                if (createForm.title.trim().length < 3) {
                  pushToast({ variant: "warning", title: "Title must be at least 3 characters" });
                  return;
                }
                if (createForm.description.trim().length < 10) {
                  pushToast({ variant: "warning", title: "Description must be at least 10 characters" });
                  return;
                }
                if (!createForm.venueId || !createForm.departmentId) {
                  pushToast({ variant: "warning", title: "Select venue and department" });
                  return;
                }
                if (!createForm.startTime || !createForm.endTime) {
                  pushToast({ variant: "warning", title: "Set start and end date/time" });
                  return;
                }
                if (Number.isNaN(Date.parse(createForm.startTime)) || Number.isNaN(Date.parse(createForm.endTime))) {
                  pushToast({ variant: "warning", title: "Invalid date/time selected" });
                  return;
                }
                if (new Date(createForm.endTime) <= new Date(createForm.startTime)) {
                  pushToast({ variant: "warning", title: "End must be after start" });
                  return;
                }
                createEvent.mutate();
              }}
              disabled={createEvent.isPending}
            >
              {createEvent.isPending ? "Submitting…" : "Submit for approval"}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)} type="button">
              Cancel
            </Button>
          </div>
        </Card>
      ) : null}

      <Card className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void refetch()}
            placeholder="Filter by title or description (server search)"
            className="md:max-w-md"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setPage(1);
              void refetch();
            }}
          >
            Apply search
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTER_CHIPS.map((status) => (
            <button
              type="button"
              key={status}
              onClick={() => {
                setActiveStatus(status);
                setPage(1);
              }}
              className={`rounded-full border px-2.5 py-1 text-xs transition-colors duration-150 ${
                activeStatus === status
                  ? "border-[hsl(var(--color-primary)/0.2)] bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary))]"
                  : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))] hover:bg-[hsl(var(--color-panel-muted))]"
              }`}
            >
              {status === "All" ? "All" : status === "CONFLICT" ? "Conflict" : status.replaceAll("_", " ")}
            </button>
          ))}
          <Button variant="ghost" size="sm" type="button" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </Card>

      {isError ? (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {error instanceof Error ? error.message : "Failed to load events"}
        </p>
      ) : null}

      <Card className="mt-4 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] px-4 py-3 text-xs text-[hsl(var(--color-text-muted))]">
          <span>
            {selectedRows.length} selected
            {data ? ` · page ${data.meta.page} of ${data.meta.totalPages} (${data.meta.total} total)` : ""}
          </span>
          {canSelectBulk ? (
            <div className="flex flex-wrap items-center gap-2">
              {canReview ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pendingSelected.length || bulkApprove.isPending}
                    onClick={() => bulkApprove.mutate(pendingSelected.map((e) => e.id))}
                  >
                    Approve pending selected
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!pendingSelected.length || bulkReject.isPending}
                    onClick={() => {
                      const reason = window.prompt("Rejection reason (applies to all):", "Bulk rejection");
                      if (reason && reason.length >= 3) {
                        bulkReject.mutate({ ids: pendingSelected.map((e) => e.id), reason });
                      }
                    }}
                  >
                    Reject pending selected
                  </Button>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[hsl(var(--color-panel-muted))] text-[hsl(var(--color-text-muted))]">
            <tr className="border-b border-[hsl(var(--color-border))]">
              {canSelectBulk ? (
                <th className="w-8 px-4 py-3 text-left font-medium">
                  <input
                    type="checkbox"
                    title="Select all on page"
                    disabled={!items.length}
                    checked={items.length > 0 && selectedRows.length === items.length}
                    onChange={() => setSelectedRows((prev) => (prev.length === items.length ? [] : items.map((row) => row.id)))}
                  />
                </th>
              ) : null}
              <th className="px-4 py-3 text-left font-medium">Event</th>
              <th className="px-4 py-3 text-left font-medium">Venue</th>
              <th className="px-4 py-3 text-left font-medium">Time</th>
              <th className="px-4 py-3 text-left font-medium">Organizer</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
                ? Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-[hsl(var(--color-border))]">
                    {canSelectBulk ? (
                      <td className="px-4 py-3">
                        <Skeleton className="h-4 w-4" />
                      </td>
                    ) : null}
                    <td className="px-4 py-3" colSpan={7}>
                      <Skeleton className="h-4 w-full" />
                    </td>
                  </tr>
                ))
              : null}
            {!isLoading
              ? items.map((row) => (
                  <tr key={row.id} className="group border-b border-[hsl(var(--color-border))]">
                    {canSelectBulk ? (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() =>
                            setSelectedRows((prev) =>
                              prev.includes(row.id) ? prev.filter((e) => e !== row.id) : [...prev, row.id]
                            )
                          }
                        />
                      </td>
                    ) : null}
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{row.title}</span>
                        {row.conflictPartner ? (
                          <span
                            className="inline-flex cursor-default items-center rounded-full border border-[hsl(var(--color-danger)/0.4)] bg-[hsl(var(--color-danger)/0.08)] px-2 py-0.5 text-[11px] font-medium text-[hsl(var(--color-danger))]"
                            title={`Overlaps with: ${row.conflictPartner.title}`}
                          >
                            Conflict
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">{row.venue?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">
                      {row.startTime ? format(parseISO(row.startTime), "PPp") : "—"}
                    </td>
                    <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">{row.organizer?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">{row.type}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(row.status)}>{row.status.replaceAll("_", " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {canReview && row.status === "PENDING" ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              onClick={() => approve.mutate(row.id)}
                              disabled={approve.isPending}
                            >
                              Approve
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = window.prompt("Rejection reason (min 3 chars):", "Schedule not feasible");
                                if (reason) reject.mutate({ id: row.id, reason });
                              }}
                              disabled={reject.isPending}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {canCreate && !isViewer ? (
                          <div className="hidden opacity-0 group-hover:opacity-100 sm:block">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => pushToast({ variant: "info", title: `Open ${row.title} (link next phase)` })}
                            >
                              View
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              : null}
            {!isLoading && !items.length ? (
              <tr>
                <td
                  colSpan={canSelectBulk ? 8 : 7}
                  className="px-4 py-6 text-center text-sm text-[hsl(var(--color-text-muted))]"
                >
                  No events match
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-[hsl(var(--color-text-muted))]">
          <span>Page {data?.meta.page ?? 1}</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
              Previous
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setPage((p) => p + 1)}
              disabled={data ? data.meta.page >= data.meta.totalPages : true}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {!isLoading && !data?.items.length ? (
        <div className="mt-4">
          <EmptyState
            title="No events in this view"
            description="Submit a new event, or change filters. USER roles only see their own events unless you are an approver or admin."
            ctaLabel="Create first event"
          />
        </div>
      ) : null}
    </div>
  );
}
