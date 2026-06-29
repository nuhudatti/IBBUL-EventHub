import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { reviewEventSchema } from "@/lib/validators/event";
import { fail, ok } from "@/lib/utils/api-response";
import { rejectPendingEvent } from "@/lib/server/event-review";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("APPROVER", session.user.role)) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  const body = await request.json();
  const parsed = reviewEventSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid rejection payload.", parsed.error.flatten(), 422);
  }

  const reason = parsed.data.reason?.trim() || "Rejected by approver";

  try {
    const result = await rejectPendingEvent({
      organizationId: session.user.organizationId,
      reviewerId: session.user.id,
      eventId: context.params.id,
      reason
    });

    if (!result.ok) {
      if (result.code === "NOT_FOUND") {
        return fail("NOT_FOUND", result.message, undefined, 404);
      }
      return fail("INVALID_STATE", result.message, result.details, 422);
    }

    return ok(result.event, "Event rejected.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not reject event.", String(error), 500);
  }
}
