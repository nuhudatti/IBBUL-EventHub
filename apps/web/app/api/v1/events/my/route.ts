import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("USER", session.user.role)) {
    return fail("FORBIDDEN", "Access denied.", undefined, 403);
  }

  try {
    const items = await prisma.event.findMany({
      where: {
        organizationId: session.user.organizationId,
        organizerId: session.user.id,
        deletedAt: null
      },
      orderBy: { startTime: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        startTime: true,
        endTime: true,
        venue: { select: { name: true } }
      }
    });

    return ok(items);
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load user events.", String(error), 500);
  }
}
