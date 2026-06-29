"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ux/toast-provider";
import { requestApi } from "@/lib/api/client";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";

type VenueBase = { id: string; name: string; code: string; capacity: number | null };
type VenueIntel = VenueBase & {
  bookingCountNext30d: number;
  utilizationScore: number;
  unresolvedConflicts: number;
  isOverbookedSignal: boolean;
};

export default function VenuesPage(): JSX.Element {
  const { status } = useSession();
  const { data: session } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const canIntel = Boolean(role && hasAnyRole(role, ["SUPER_ADMIN", "ADMIN", "APPROVER"]));
  const canManage = Boolean(role && canAccess("ADMIN", role));
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", capacity: "", building: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["venues", canIntel ? "intel" : "base"],
    queryFn: () =>
      requestApi<VenueBase[] | VenueIntel[]>(canIntel ? "/api/v1/venues?intelligence=1" : "/api/v1/venues"),
    enabled: status === "authenticated"
  });

  const rows = data ?? [];

  const createVenue = useMutation({
    mutationFn: () =>
      requestApi(`/api/v1/venues`, {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          code: form.code.trim(),
          building: form.building.trim() || undefined,
          capacity: form.capacity ? Number(form.capacity) : undefined
        })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["venues"] });
      setShowCreate(false);
      setForm({ name: "", code: "", capacity: "", building: "" });
      pushToast({ variant: "success", title: "Venue created" });
    },
    onError: (err) => pushToast({ variant: "error", title: err instanceof Error ? err.message : "Failed" })
  });

  return (
    <div>
      <PageHeader
        title="Venues"
        description="Campus venues for IBBUL events. Administrators can add new spaces."
        rightSlot={
          canManage ? (
            <Button onClick={() => setShowCreate((v) => !v)}>{showCreate ? "Close" : "Add venue"}</Button>
          ) : null
        }
      />
      {showCreate && canManage ? (
        <Card className="mb-4 grid gap-3 md:grid-cols-2">
          <Input placeholder="Venue name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
          <Input placeholder="Code (e.g. LT1)" value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} />
          <Input placeholder="Building" value={form.building} onChange={(e) => setForm((c) => ({ ...c, building: e.target.value }))} />
          <Input placeholder="Capacity" type="number" value={form.capacity} onChange={(e) => setForm((c) => ({ ...c, capacity: e.target.value }))} />
          <Button onClick={() => createVenue.mutate()} disabled={createVenue.isPending}>
            {createVenue.isPending ? "Saving…" : "Save venue"}
          </Button>
        </Card>
      ) : null}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-24 w-full" />
              </Card>
            ))
          : null}
        {!isLoading &&
          rows.map((venue) => {
            const intel = canIntel && "utilizationScore" in venue ? (venue as VenueIntel) : null;
            return (
              <Card
                key={venue.id}
                className="p-4 transition-shadow duration-150 hover:shadow-[var(--shadow-sm)]"
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-base font-semibold">{venue.name}</h2>
                  {intel?.isOverbookedSignal ? <Badge variant="danger">Hot</Badge> : <Badge variant="success">OK</Badge>}
                </div>
                <p className="mt-2 text-sm text-[hsl(var(--color-text-muted))]">
                  {venue.code}
                  {venue.capacity ? ` · Cap ${venue.capacity}` : ""}
                </p>
                {intel ? (
                  <p className="mt-2 text-xs text-[hsl(var(--color-text-muted))]">
                    Next 30d bookings: {intel.bookingCountNext30d} · Score {intel.utilizationScore} · Conflicts{" "}
                    {intel.unresolvedConflicts}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-[hsl(var(--color-text-muted))]">Approver+ sees utilization.</p>
                )}
              </Card>
            );
          })}
      </div>
    </div>
  );
}
