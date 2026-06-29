import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("APPROVER", session.user.role)) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  try {
    const items = await prisma.event.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: "PENDING",
        deletedAt: null
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        venue: { select: { name: true } },
        organizer: { select: { name: true } }
      }
    });

    return ok(items);
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load pending events.", String(error), 500);
  }
}
