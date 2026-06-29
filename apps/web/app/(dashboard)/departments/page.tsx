"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { useToast } from "@/components/ux/toast-provider";
import { requestApi } from "@/lib/api/client";
import { canAccess, type AppRole } from "@/lib/auth/rbac";

type DepartmentRow = {
  id: string;
  name: string;
  slug: string;
  color?: string | null;
  parentId?: string | null;
  parent?: { id: string; name: string } | null;
  children: Array<{ id: string; name: string; slug: string }>;
};

export default function DepartmentsPage(): JSX.Element {
  const { data: session } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const canManage = Boolean(role && canAccess("ADMIN", role));
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    parentId: "",
    description: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["departments-admin"],
    queryFn: () => requestApi<DepartmentRow[]>(`/api/v1/departments`)
  });

  const faculties = useMemo(() => (data ?? []).filter((row) => !row.parentId), [data]);

  const filtered = faculties.filter((faculty) => {
    const haystack = [faculty.name, ...(faculty.children ?? []).map((child) => child.name)].join(" ").toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const createDepartment = useMutation({
    mutationFn: () =>
      requestApi(`/api/v1/departments`, {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: form.description.trim() || undefined,
          parentId: form.parentId || undefined
        })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["departments-admin"] });
      void queryClient.invalidateQueries({ queryKey: ["departments-options"] });
      setShowCreate(false);
      setForm({ name: "", slug: "", parentId: "", description: "" });
      pushToast({ variant: "success", title: "Saved successfully" });
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Could not save" });
    }
  });

  return (
    <div>
      <PageHeader
        title="Faculties & Departments"
        description="IBBUL organizational hierarchy — faculties, departments, and event ownership."
        rightSlot={
          canManage ? (
            <Button onClick={() => setShowCreate((value) => !value)}>{showCreate ? "Close" : "Add unit"}</Button>
          ) : null
        }
      />

      {showCreate && canManage ? (
        <Card className="mb-4 grid gap-3 md:grid-cols-2">
          <Input
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Name (faculty or department)"
          />
          <Input
            value={form.slug}
            onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            placeholder="Slug (e.g. computer-science)"
          />
          <select
            className="h-10 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm md:col-span-2"
            value={form.parentId}
            onChange={(event) => setForm((current) => ({ ...current, parentId: event.target.value }))}
          >
            <option value="">Top-level faculty (no parent)</option>
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                Department under {faculty.name}
              </option>
            ))}
          </select>
          <textarea
            className="min-h-[80px] rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-3 py-2 text-sm md:col-span-2"
            value={form.description}
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Optional description"
          />
          <Button
            onClick={() => {
              if (form.name.trim().length < 2 || form.slug.trim().length < 2) {
                pushToast({ variant: "warning", title: "Name and slug are required" });
                return;
              }
              createDepartment.mutate();
            }}
            disabled={createDepartment.isPending}
          >
            {createDepartment.isPending ? "Saving…" : "Save"}
          </Button>
        </Card>
      ) : null}

      <Card className="mb-4">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search faculties or departments…" className="max-w-lg" />
      </Card>

      {isLoading ? (
        <Card className="p-6 text-sm text-[hsl(var(--color-text-muted))]">Loading hierarchy…</Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No faculties or departments found"
          description="Seed data or create faculties first, then add departments under each faculty."
        />
      ) : (
        <Card>
          <div className="space-y-3 text-sm">
            {filtered.map((faculty) => (
              <div key={faculty.id} className="rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] px-3 py-2">
                <p className="font-medium">{faculty.name}</p>
                <p className="text-xs text-[hsl(var(--color-text-muted))]">Faculty · {faculty.slug}</p>
                <div className="mt-2 space-y-1 pl-3 text-[hsl(var(--color-text-muted))]">
                  {(faculty.children ?? []).length === 0 ? (
                    <p className="text-xs italic">No departments yet</p>
                  ) : (
                    faculty.children.map((child) => (
                      <p key={child.id}>
                        {child.name} <span className="text-xs">({child.slug})</span>
                      </p>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
