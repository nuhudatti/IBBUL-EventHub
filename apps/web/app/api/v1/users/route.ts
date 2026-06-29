import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";
import { z } from "zod";

const listSchema = z.object({
  role: z.enum(["SUPER_ADMIN", "ADMIN", "APPROVER", "USER", "VIEWER"]).optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "PENDING"]).optional(),
  search: z.string().max(80).optional()
});

/**
 * List organization users (administrators only).
 */
export async function GET(request: Request): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const role = session.user.role as AppRole;
  if (!hasAnyRole(role, ["SUPER_ADMIN", "ADMIN"])) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const params = new URL(request.url).searchParams;
  const parsed = listSchema.safeParse(Object.fromEntries(params.entries()));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid query.", parsed.error.flatten(), 422);
  }

  const { role: roleFilter, status: statusFilter, search } = parsed.data;

  try {
    const items = await prisma.user.findMany({
      where: {
        organizationId: session.user.organizationId,
        deletedAt: null,
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" as const } },
                { email: { contains: search, mode: "insensitive" as const } }
              ]
            }
          : {})
      },
      orderBy: { name: "asc" },
      take: 200,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        department: { select: { id: true, name: true } },
        activities: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { action: true, entityType: true, createdAt: true }
        }
      }
    });

    return ok({
      items: items.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
        department: u.department ? { id: u.department.id, name: u.department.name } : null,
        lastLoginAt: u.lastLoginAt?.toISOString() ?? null,
        lastActivity: u.activities[0]
          ? {
              action: u.activities[0].action,
              entityType: u.activities[0].entityType,
              at: u.activities[0].createdAt.toISOString()
            }
          : null
      }))
    });
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load users.", String(error), 500);
  }
}
