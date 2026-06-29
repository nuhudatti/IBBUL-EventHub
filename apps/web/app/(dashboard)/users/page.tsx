"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ux/toast-provider";
import { requestApi } from "@/lib/api/client";
import { getRoleDisplayName } from "@/lib/auth/role-labels";
import { hasAnyRole, type AppRole } from "@/lib/auth/rbac";

type UserRole = "SUPER_ADMIN" | "ADMIN" | "APPROVER" | "USER" | "VIEWER";
type UserStatus = "ACTIVE" | "SUSPENDED" | "PENDING";

type UserRow = {
  id: string;
  name: string;
  email: string | null;
  role: UserRole;
  status: UserStatus;
  department: { id: string; name: string } | null;
  lastLoginAt: string | null;
  lastActivity: { action: string; entityType: string; at: string } | null;
};

type UsersResponse = { items: UserRow[] };
type DepartmentRow = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: Array<{ id: string; name: string }>;
};

type InviteResponse = {
  userId: string;
  email: string;
  inviteUrl: string;
  expiresAt: string;
  roleLabel?: string;
  emailSent?: boolean;
  emailPreview?: boolean;
};

function showFaculty(role: UserRole): boolean {
  return role === "ADMIN" || role === "APPROVER" || role === "USER" || role === "VIEWER";
}

function showDepartment(role: UserRole): boolean {
  return role === "APPROVER" || role === "USER" || role === "VIEWER";
}

function facultyRequired(role: UserRole): boolean {
  return role === "USER";
}

function departmentRequired(role: UserRole): boolean {
  return role === "USER" || role === "APPROVER";
}

export default function UsersPage(): JSX.Element {
  const { data: session, status } = useSession();
  const role = session?.user?.role as AppRole | undefined;
  const canManage = Boolean(role && hasAnyRole(role, ["SUPER_ADMIN", "ADMIN"]));
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | UserStatus>("ALL");
  const [showInvite, setShowInvite] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);
  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "USER" as UserRole,
    facultyId: "",
    departmentId: ""
  });

  const { data, isLoading } = useQuery({
    queryKey: ["users", query, roleFilter, statusFilter],
    queryFn: () => {
      const p = new URLSearchParams();
      if (query.trim()) p.set("search", query.trim());
      if (roleFilter !== "ALL") p.set("role", roleFilter);
      if (statusFilter !== "ALL") p.set("status", statusFilter);
      const qs = p.toString();
      return requestApi<UsersResponse>(`/api/v1/users${qs ? `?${qs}` : ""}`);
    },
    enabled: status === "authenticated" && canManage
  });

  const { data: departments } = useQuery({
    queryKey: ["departments-options"],
    queryFn: () => requestApi<DepartmentRow[]>(`/api/v1/departments`),
    enabled: showInvite && canManage
  });

  const faculties = useMemo(() => (departments ?? []).filter((row) => !row.parentId), [departments]);
  const departmentOptions = useMemo(() => {
    const list: Array<{ id: string; label: string; facultyId: string }> = [];
    for (const faculty of faculties) {
      for (const child of faculty.children ?? []) {
        list.push({ id: child.id, label: `${faculty.name} › ${child.name}`, facultyId: faculty.id });
      }
    }
    return list;
  }, [faculties]);

  const updateUser = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, string> }) =>
      requestApi<unknown>(`/api/v1/users/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      pushToast({ variant: "success", title: "User updated" });
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Update failed" });
    }
  });

  const inviteUser = useMutation({
    mutationFn: () =>
      requestApi<InviteResponse>(`/api/v1/users/invite`, {
        method: "POST",
        body: JSON.stringify({
          name: inviteForm.name.trim(),
          email: inviteForm.email.trim(),
          role: inviteForm.role,
          facultyId: inviteForm.facultyId || undefined,
          departmentId: inviteForm.departmentId || undefined,
          sendInvitation: true
        })
      }),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ["users"] });
      setLastInviteUrl(result.inviteUrl);
      setInviteForm({ name: "", email: "", role: "USER", facultyId: "", departmentId: "" });
      pushToast({
        variant: result.emailPreview ? "info" : "success",
        title: result.emailPreview ? "Invitation created (email preview mode)" : "Invitation email sent",
        description: result.emailPreview
          ? "Configure SMTP in .env for real delivery. Copy the link below."
          : `Sent to ${result.email} as ${result.roleLabel ?? "staff"}.`
      });
    },
    onError: (err) => {
      pushToast({ variant: "error", title: err instanceof Error ? err.message : "Invitation failed" });
    }
  });

  const filteredRows = useMemo(() => data?.items ?? [], [data]);

  if (!canManage) {
    return (
      <div>
        <PageHeader title="Users" description="Administrator access is required to manage users." />
        <Card className="p-6 text-sm text-[hsl(var(--color-text-muted))]">You do not have access to this area.</Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="User Management"
        description="Invite staff with institutional email. The system sends an invitation — administrators never set passwords."
        rightSlot={
          <Button onClick={() => setShowInvite((value) => !value)}>{showInvite ? "Close invite form" : "Invite user"}</Button>
        }
      />

      {showInvite ? (
        <Card className="mb-4 grid gap-3 md:grid-cols-2">
          <Input
            placeholder="Full name"
            value={inviteForm.name}
            onChange={(e) => setInviteForm((c) => ({ ...c, name: e.target.value }))}
          />
          <Input
            type="email"
            placeholder="Institutional email"
            value={inviteForm.email}
            onChange={(e) => setInviteForm((c) => ({ ...c, email: e.target.value }))}
          />
          <select
            className="h-10 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm md:col-span-2"
            value={inviteForm.role}
            onChange={(e) => {
              const nextRole = e.target.value as UserRole;
              setInviteForm({ name: inviteForm.name, email: inviteForm.email, role: nextRole, facultyId: "", departmentId: "" });
            }}
          >
            {(["USER", "APPROVER", "ADMIN", "VIEWER", "SUPER_ADMIN"] as const).map((r) => (
              <option key={r} value={r} disabled={r === "SUPER_ADMIN" && role !== "SUPER_ADMIN"}>
                {getRoleDisplayName(r)}
              </option>
            ))}
          </select>
          {showFaculty(inviteForm.role) ? (
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm"
              value={inviteForm.facultyId}
              onChange={(e) => setInviteForm((c) => ({ ...c, facultyId: e.target.value, departmentId: "" }))}
            >
              <option value="">{facultyRequired(inviteForm.role) ? "Select faculty" : "Faculty (optional)"}</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          ) : null}
          {showDepartment(inviteForm.role) ? (
            <select
              className="h-10 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel))] px-2 text-sm"
              value={inviteForm.departmentId}
              onChange={(e) => {
                const dept = departmentOptions.find((d) => d.id === e.target.value);
                setInviteForm((c) => ({
                  ...c,
                  departmentId: e.target.value,
                  facultyId: dept?.facultyId ?? c.facultyId
                }));
              }}
            >
              <option value="">{departmentRequired(inviteForm.role) ? "Select department" : "Department (optional)"}</option>
              {departmentOptions
                .filter((d) => !inviteForm.facultyId || d.facultyId === inviteForm.facultyId)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
            </select>
          ) : null}
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <Button
              onClick={() => {
                if (inviteForm.name.trim().length < 2 || !inviteForm.email.includes("@")) {
                  pushToast({ variant: "warning", title: "Enter full name and valid email" });
                  return;
                }
                if (facultyRequired(inviteForm.role) && !inviteForm.facultyId && !inviteForm.departmentId) {
                  pushToast({ variant: "warning", title: "Select faculty and department for lecturers" });
                  return;
                }
                if (departmentRequired(inviteForm.role) && !inviteForm.departmentId) {
                  pushToast({ variant: "warning", title: "Select a department" });
                  return;
                }
                inviteUser.mutate();
              }}
              disabled={inviteUser.isPending}
            >
              {inviteUser.isPending ? "Sending invitation…" : "Send invitation"}
            </Button>
          </div>
          {lastInviteUrl ? (
            <div className="md:col-span-2 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-muted))] p-3 text-xs">
              <p className="font-medium">Invitation link (demo — copy for presentation)</p>
              <p className="mt-1 break-all text-[hsl(var(--color-text-muted))]">{lastInviteUrl}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  void navigator.clipboard.writeText(lastInviteUrl);
                  pushToast({ variant: "info", title: "Link copied" });
                }}
              >
                Copy link
              </Button>
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" className="max-w-lg" />
        <div className="flex flex-wrap gap-2">
          {(["ALL", "VIEWER", "USER", "APPROVER", "ADMIN", "SUPER_ADMIN"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                roleFilter === r
                  ? "border-[hsl(var(--color-primary)/0.2)] bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary))]"
                  : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
              }`}
            >
              {r === "ALL" ? "All roles" : getRoleDisplayName(r)}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(["ALL", "ACTIVE", "PENDING", "SUSPENDED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full border px-2.5 py-1 text-xs ${
                statusFilter === s
                  ? "border-[hsl(var(--color-primary)/0.2)] bg-[hsl(var(--color-primary-soft))] text-[hsl(var(--color-primary))]"
                  : "border-[hsl(var(--color-border))] text-[hsl(var(--color-text-muted))]"
              }`}
            >
              {s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-[hsl(var(--color-panel-muted))] text-[hsl(var(--color-text-muted))]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Department</th>
              <th className="px-4 py-3 text-left font-medium">Role</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6">
                  <Skeleton className="h-10 w-full" />
                </td>
              </tr>
            ) : null}
            {!isLoading &&
              filteredRows.map((user) => (
                <tr key={user.id} className="border-t border-[hsl(var(--color-border))] hover:bg-[hsl(var(--color-panel-muted))]/50">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">{user.email ?? "—"}</td>
                  <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">{user.department?.name ?? "—"}</td>
                  <td className="px-4 py-3">{getRoleDisplayName(user.role)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={user.status === "ACTIVE" ? "success" : user.status === "SUSPENDED" ? "danger" : "warning"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {user.status === "ACTIVE" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={user.id === session?.user?.id || updateUser.isPending}
                          onClick={() => updateUser.mutate({ id: user.id, body: { status: "SUSPENDED" } })}
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateUser.isPending}
                          onClick={() => updateUser.mutate({ id: user.id, body: { status: "ACTIVE" } })}
                        >
                          Activate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {!isLoading && filteredRows.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-[hsl(var(--color-text-muted))]">No users match filters.</p>
        ) : null}
      </Card>
    </div>
  );
}
