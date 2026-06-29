import type { Prisma, UserRole, UserScope } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { inferScopeFromRole } from "@/lib/auth/nav";

export type ScopeUser = {
  id: string;
  role: UserRole | AppRole;
  organizationId: string;
  departmentId?: string | null;
  facultyId?: string | null;
  scope?: UserScope | null;
};

async function departmentIdsUnderFaculty(facultyId: string, organizationId: string): Promise<string[]> {
  const departments = await prisma.department.findMany({
    where: {
      organizationId,
      deletedAt: null,
      OR: [{ id: facultyId }, { parentId: facultyId }]
    },
    select: { id: true }
  });
  return departments.map((row) => row.id);
}

/**
 * Applies organizational scope filters to event queries without breaking existing RBAC.
 */
export async function applyEventScopeFilter(
  where: Prisma.EventWhereInput,
  user: ScopeUser
): Promise<void> {
  const role = user.role as AppRole;

  if (role === "VIEWER" || user.scope === "PUBLIC") {
    where.status = "APPROVED";
    return;
  }

  const scope = user.scope ?? inferScopeFromRole(role);

  if (hasAnyRole(role, ["SUPER_ADMIN", "ADMIN"]) || scope === "UNIVERSITY") {
    return;
  }

  if (role === "USER") {
    where.organizerId = user.id;
    return;
  }

  if (scope === "FACULTY" && user.facultyId) {
    const ids = await departmentIdsUnderFaculty(user.facultyId, user.organizationId);
    where.departmentId = { in: ids };
    return;
  }

  if (scope === "DEPARTMENT" && user.departmentId) {
    where.departmentId = user.departmentId;
  }
}
