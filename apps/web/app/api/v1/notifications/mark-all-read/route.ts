import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";

export async function POST(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  try {
    const now = new Date();
    const result = await prisma.notification.updateMany({
      where: { userId: session.user.id, deletedAt: null, isRead: false },
      data: { isRead: true, readAt: now }
    });

    return ok({ updated: result.count }, "All notifications marked read.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not mark notifications read.", String(error), 500);
  }
}
