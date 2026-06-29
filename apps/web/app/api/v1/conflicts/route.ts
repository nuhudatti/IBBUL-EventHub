import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";

/**
 * Unresolved scheduling conflicts for operational triage.
 */
export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("APPROVER", session.user.role)) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  const role = session.user.role as AppRole;
  if (!hasAnyRole(role, ["SUPER_ADMIN", "ADMIN", "APPROVER"])) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  const orgId = session.user.organizationId;

  try {
    const items = await prisma.conflictLog.findMany({
      where: {
        resolvedAt: null,
        venue: { organizationId: orgId }
      },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        venue: { select: { id: true, name: true, code: true } },
        newEvent: {
          select: { id: true, title: true, startTime: true, endTime: true, status: true }
        },
        conflictingEvent: {
          select: { id: true, title: true, startTime: true, endTime: true, status: true }
        }
      }
    });

    return ok({ items });
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load conflicts.", String(error), 500);
  }
}
