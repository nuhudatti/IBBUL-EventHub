import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";
import { approvePendingEvent } from "@/lib/server/event-review";

export async function PATCH(
  _request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("APPROVER", session.user.role)) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  try {
    const result = await approvePendingEvent({
      organizationId: session.user.organizationId,
      approverId: session.user.id,
      eventId: context.params.id
    });

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return fail("NOT_FOUND", result.message, undefined, 404);
      }
      if (result.code === "CONFLICT") {
        return fail("CONFLICT_DETECTED", result.message, result.details, 409);
      }
      return fail("INVALID_STATE", result.message, result.details, 422);
    }

    return ok(result.event, "Event approved.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not approve event.", String(error), 500);
  }
}
