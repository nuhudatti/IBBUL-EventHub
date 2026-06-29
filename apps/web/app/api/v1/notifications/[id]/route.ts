import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";
import { z } from "zod";

const patchSchema = z.object({
  read: z.boolean()
});

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid payload.", parsed.error.flatten(), 422);
  }

  try {
    const existing = await prisma.notification.findFirst({
      where: { id: context.params.id, userId: session.user.id, deletedAt: null }
    });

    if (!existing) {
      return fail("NOT_FOUND", "Notification not found.", undefined, 404);
    }

    const updated = await prisma.notification.update({
      where: { id: existing.id },
      data: {
        isRead: parsed.data.read,
        readAt: parsed.data.read ? new Date() : null
      },
      select: {
        id: true,
        isRead: true,
        readAt: true,
        title: true,
        type: true,
        data: true
      }
    });

    return ok(updated, "Notification updated.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not update notification.", String(error), 500);
  }
}
