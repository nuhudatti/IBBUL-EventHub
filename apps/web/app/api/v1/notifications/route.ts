import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api-response";

const listSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20)
});

/**
 * In-app notification feed for the current user, newest first.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  const parsed = listSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid query.", parsed.error.flatten(), 422);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  try {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id, deletedAt: null },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          body: true,
          type: true,
          isRead: true,
          createdAt: true,
          data: true
        }
      }),
      prisma.notification.count({ where: { userId: session.user.id, deletedAt: null } })
    ]);

    return ok(
      { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } },
      "Notifications loaded."
    );
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load notifications.", String(error), 500);
  }
}
