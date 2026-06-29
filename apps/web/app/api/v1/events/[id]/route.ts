import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { patchEventSchema } from "@/lib/validators/event";
import { detectVenueConflict } from "@/lib/events/conflict";
import { approvePendingEvent, rejectPendingEvent } from "@/lib/server/event-review";
import { fail, ok } from "@/lib/utils/api-response";

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("APPROVER", session.user.role)) {
    return fail("FORBIDDEN", "Approver access required.", undefined, 403);
  }

  const role = session.user.role as AppRole;
  const isElevated = hasAnyRole(role, ["SUPER_ADMIN", "ADMIN"]);
  const isApproverOnly = hasAnyRole(role, ["APPROVER"]) && !isElevated;

  const body = await request.json();
  const parsed = patchEventSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid event update.", parsed.error.flatten(), 422);
  }

  const eventId = context.params.id;

  try {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizationId: session.user.organizationId,
        deletedAt: null
      }
    });

    if (!event) {
      return fail("NOT_FOUND", "Event not found.", undefined, 404);
    }

    if (isApproverOnly) {
      if (event.status !== "PENDING") {
        return fail("FORBIDDEN", "Approvers can only edit pending events.", undefined, 403);
      }
      if (parsed.data.status !== undefined) {
        return fail("FORBIDDEN", "Use approve or reject actions to change pending status.", undefined, 403);
      }
    }

    if (parsed.data.status === "APPROVED") {
      if (!isElevated && !hasAnyRole(role, ["APPROVER"])) {
        return fail("FORBIDDEN", "Cannot approve via this endpoint.", undefined, 403);
      }
      const result = await approvePendingEvent({
        organizationId: session.user.organizationId,
        approverId: session.user.id,
        eventId: event.id
      });
      if (!result.ok) {
        if (result.code === "CONFLICT") {
          return fail("CONFLICT_DETECTED", result.message, result.details, 409);
        }
        return fail(result.code, result.message, result.details, result.code === "NOT_FOUND" ? 404 : 400);
      }
      return ok(result.event, "Event approved.");
    }

    if (parsed.data.status === "REJECTED") {
      if (!isElevated && !hasAnyRole(role, ["APPROVER"])) {
        return fail("FORBIDDEN", "Cannot reject via this endpoint.", undefined, 403);
      }
      const reason = parsed.data.rejectionReason ?? "Rejected";
      const result = await rejectPendingEvent({
        organizationId: session.user.organizationId,
        reviewerId: session.user.id,
        eventId: event.id,
        reason
      });
      if (!result.ok) {
        return fail(result.code, result.message, undefined, result.code === "NOT_FOUND" ? 404 : 400);
      }
      return ok(result.event, "Event rejected.");
    }

    if (parsed.data.status !== undefined && !isElevated) {
      return fail("FORBIDDEN", "Only administrators can set this status.", undefined, 403);
    }

    const nextVenueId = parsed.data.venueId ?? event.venueId;
    const nextStart = parsed.data.startTime ? new Date(parsed.data.startTime) : event.startTime;
    const nextEnd = parsed.data.endTime ? new Date(parsed.data.endTime) : event.endTime;

    if (parsed.data.startTime && !parsed.data.endTime && nextEnd <= nextStart) {
      return fail("VALIDATION_ERROR", "End time must be after start time.", undefined, 422);
    }
    if (!parsed.data.startTime && parsed.data.endTime && nextEnd <= nextStart) {
      return fail("VALIDATION_ERROR", "End time must be after start time.", undefined, 422);
    }

    const rescheduleFields =
      parsed.data.startTime !== undefined || parsed.data.endTime !== undefined || parsed.data.venueId !== undefined;

    if (rescheduleFields && (event.status === "APPROVED" || event.status === "PENDING")) {
      const conflict = await detectVenueConflict({
        organizationId: event.organizationId,
        venueId: nextVenueId,
        startTime: nextStart,
        endTime: nextEnd,
        excludeEventId: event.id
      });
      if (conflict) {
        return fail("CONFLICT_DETECTED", "Update would overlap another booking.", { conflictingEventId: conflict.id }, 409);
      }
    }

    const data: Prisma.EventUpdateInput = {};
    if (parsed.data.venueId !== undefined) {
      data.venue = { connect: { id: parsed.data.venueId } };
    }
    if (parsed.data.departmentId !== undefined) {
      data.department = { connect: { id: parsed.data.departmentId } };
    }
    if (parsed.data.startTime !== undefined) data.startTime = nextStart;
    if (parsed.data.endTime !== undefined) data.endTime = nextEnd;
    const remainingStatus = parsed.data.status;
    if (remainingStatus !== undefined) {
      data.status = remainingStatus;
    }

    const updated = await prisma.event.update({
      where: { id: event.id },
      data,
      select: {
        id: true,
        title: true,
        status: true,
        startTime: true,
        endTime: true,
        venueId: true,
        departmentId: true,
        venue: { select: { id: true, name: true, code: true } },
        organizer: { select: { id: true, name: true, email: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "EVENT_UPDATED",
        entityType: "Event",
        entityId: event.id,
        newValue: parsed.data as object
      }
    });

    return ok(updated, "Event updated.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not update event.", String(error), 500);
  }
}
