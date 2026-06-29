import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api-response";

/**
 * List active event categories for the current organization.
 */
export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  try {
    const items = await prisma.eventCategory.findMany({
      where: { organizationId: session.user.organizationId, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true }
    });
    return ok(items);
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load event categories.", String(error), 500);
  }
}
