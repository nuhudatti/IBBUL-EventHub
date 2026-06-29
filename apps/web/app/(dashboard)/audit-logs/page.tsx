"use client";

import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { requestApi } from "@/lib/api/client";
import { getRoleDisplayName } from "@/lib/auth/role-labels";

type AuditRow = {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata: unknown;
  createdAt: string;
  user: { id: string; name: string; email: string | null; role: string };
};

export default function AuditLogsPage(): JSX.Element {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => requestApi<AuditRow[]>(`/api/v1/audit-logs`)
  });

  return (
    <div>
      <PageHeader
        title="Audit History"
        description="Recent administrative and event actions across the IBBUL platform."
      />
      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-[hsl(var(--color-panel-muted))] text-[hsl(var(--color-text-muted))]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">When</th>
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Action</th>
              <th className="px-4 py-3 text-left font-medium">Resource</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6">
                  <Skeleton className="h-10 w-full" />
                </td>
              </tr>
            ) : null}
            {(data ?? []).map((row) => (
              <tr key={row.id} className="border-t border-[hsl(var(--color-border))]">
                <td className="px-4 py-3 text-xs text-[hsl(var(--color-text-muted))]">
                  {format(parseISO(row.createdAt), "PPp")}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{row.user.name}</p>
                  <p className="text-xs text-[hsl(var(--color-text-muted))]">{getRoleDisplayName(row.user.role)}</p>
                </td>
                <td className="px-4 py-3">{row.action.replaceAll("_", " ")}</td>
                <td className="px-4 py-3 text-[hsl(var(--color-text-muted))]">
                  {row.resource} · {row.resourceId.slice(0, 8)}…
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && (data ?? []).length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-[hsl(var(--color-text-muted))]">No audit entries yet.</p>
        ) : null}
      </Card>
    </div>
  );
}
