import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api-response";

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  try {
    const items = await prisma.auditLog.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        metadata: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true, role: true } }
      }
    });

    return ok(
      items.map((row) => ({
        id: row.id,
        action: row.action,
        resource: row.resource,
        resourceId: row.resourceId,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
        user: row.user
      }))
    );
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load audit history.", String(error), 500);
  }
}
