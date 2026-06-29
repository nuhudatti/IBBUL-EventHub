import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { bulkEventIdsSchema } from "@/lib/validators/event";
import { approvePendingEvent } from "@/lib/server/event-review";
import { fail, ok } from "@/lib/utils/api-response";

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("APPROVER", session.user.role)) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  const body = await request.json();
  const parsed = bulkEventIdsSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid payload.", parsed.error.flatten(), 422);
  }

  const succeeded: string[] = [];
  const failed: Array<{ id: string; message: string; code?: string }> = [];

  for (const id of parsed.data.ids) {
    const result = await approvePendingEvent({
      organizationId: session.user.organizationId,
      approverId: session.user.id,
      eventId: id
    });
    if (result.ok) {
      succeeded.push(id);
    } else {
      failed.push({ id, message: result.message, code: result.code });
    }
  }

  return ok({ succeeded, failed }, "Bulk approve completed.");
}
