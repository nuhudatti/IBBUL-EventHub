import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { userRoleUpdateSchema } from "@/lib/validators/user";
import { fail, ok } from "@/lib/utils/api-response";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const actorRole = session.user.role as AppRole;
  if (!hasAnyRole(actorRole, ["SUPER_ADMIN", "ADMIN"])) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const body = await request.json();
  const parsed = userRoleUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid payload.", parsed.error.flatten(), 422);
  }

  const targetId = context.params.id;
  if (targetId === session.user.id && parsed.data.role !== undefined) {
    return fail("FORBIDDEN", "You cannot change your own role from this screen.", undefined, 403);
  }

  if (parsed.data.role === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
    return fail("FORBIDDEN", "Only a super administrator can assign the SUPER_ADMIN role.", undefined, 403);
  }

  try {
    const target = await prisma.user.findFirst({
      where: {
        id: targetId,
        organizationId: session.user.organizationId,
        deletedAt: null
      },
      select: { id: true, role: true, name: true, status: true }
    });

    if (!target) {
      return fail("NOT_FOUND", "User not found.", undefined, 404);
    }

    if (parsed.data.role && target.role === "SUPER_ADMIN" && parsed.data.role !== "SUPER_ADMIN") {
      const otherSupers = await prisma.user.count({
        where: {
          organizationId: session.user.organizationId,
          deletedAt: null,
          role: "SUPER_ADMIN",
          id: { not: target.id }
        }
      });
      if (otherSupers === 0) {
        return fail("INVALID_STATE", "Cannot remove the last super administrator for this organization.", undefined, 400);
      }
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: {
        ...(parsed.data.role ? { role: parsed.data.role } : {}),
        ...(parsed.data.status ? { status: parsed.data.status } : {})
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        department: { select: { id: true, name: true, slug: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: parsed.data.status ? "USER_STATUS_CHANGED" : "USER_ROLE_CHANGED",
        entityType: "User",
        entityId: target.id,
        oldValue: { role: target.role, status: target.status },
        newValue: {
          ...(parsed.data.role ? { role: parsed.data.role } : {}),
          ...(parsed.data.status ? { status: parsed.data.status } : {})
        }
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        organizationId: session.user.organizationId,
        action: parsed.data.status ? "USER_STATUS_CHANGED" : "USER_ROLE_CHANGED",
        resource: "User",
        resourceId: target.id,
        metadata: {
          previousRole: target.role,
          nextRole: parsed.data.role ?? target.role,
          previousStatus: target.status,
          nextStatus: parsed.data.status ?? target.status
        }
      }
    });

    return ok(updated, parsed.data.status ? "User status updated." : "User role updated.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not update user.", String(error), 500);
  }
}
