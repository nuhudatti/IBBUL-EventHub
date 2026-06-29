import { prisma } from "@/lib/db/prisma";
import { detectVenueConflict } from "@/lib/events/conflict";
import { writeAuditLog } from "@/lib/server/audit";
import { notifyStudentsOfApprovedEvent } from "@/lib/server/event-approvers";

export type ApproveResult =
  | { ok: true; event: { id: string; title: string; status: string; startTime: Date; endTime: Date } }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INVALID_STATE"; message: string; details?: unknown };

/**
 * Approves a pending event after venue/time conflict check. Sends organizer notification.
 */
export async function approvePendingEvent(params: {
  organizationId: string;
  approverId: string;
  eventId: string;
}): Promise<ApproveResult> {
  const event = await prisma.event.findFirst({
    where: {
      id: params.eventId,
      organizationId: params.organizationId,
      deletedAt: null
    }
  });

  if (!event) {
    return { ok: false, code: "NOT_FOUND", message: "Event not found." };
  }

  if (event.status !== "PENDING") {
    return { ok: false, code: "INVALID_STATE", message: "Only pending events can be approved.", details: { status: event.status } };
  }

  const conflict = await detectVenueConflict({
    organizationId: event.organizationId,
    venueId: event.venueId,
    startTime: event.startTime,
    endTime: event.endTime,
    excludeEventId: event.id
  });

  if (conflict) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "Cannot approve because slot is already occupied.",
      details: { conflictingEventId: conflict.id, conflictingTitle: conflict.title }
    };
  }

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: {
      status: "APPROVED",
      approvedAt: new Date(),
      approvedBy: params.approverId,
      rejectionReason: null
    },
    select: {
      id: true,
      title: true,
      status: true,
      startTime: true,
      endTime: true
    }
  });

  await prisma.notification.create({
    data: {
      userId: event.organizerId,
      title: "Event approved",
      body: `${event.title} has been approved and added to the calendar.`,
      type: "EVENT_APPROVED",
      data: { eventId: event.id, status: "APPROVED" },
      channel: "IN_APP"
    }
  });

  await prisma.conflictLog.updateMany({
    where: {
      resolvedAt: null,
      OR: [{ newEventId: event.id }, { conflictingEventId: event.id }]
    },
    data: {
      resolvedAt: new Date(),
      resolvedBy: params.approverId
    }
  });

  await writeAuditLog({
    userId: params.approverId,
    organizationId: params.organizationId,
    action: "EVENT_APPROVED",
    resource: "event",
    resourceId: event.id,
    metadata: { title: event.title, previousStatus: "PENDING", newStatus: "APPROVED" }
  });

  await notifyStudentsOfApprovedEvent({
    organizationId: params.organizationId,
    eventId: event.id,
    title: event.title
  });

  return { ok: true, event: updated };
}

export type RejectResult =
  | { ok: true; event: { id: string; title: string; status: string; rejectionReason: string | null } }
  | { ok: false; code: "NOT_FOUND" | "INVALID_STATE"; message: string; details?: unknown };

export async function rejectPendingEvent(params: {
  organizationId: string;
  reviewerId: string;
  eventId: string;
  reason: string;
}): Promise<RejectResult> {
  const event = await prisma.event.findFirst({
    where: {
      id: params.eventId,
      organizationId: params.organizationId,
      deletedAt: null
    }
  });

  if (!event) {
    return { ok: false, code: "NOT_FOUND", message: "Event not found." };
  }

  if (event.status !== "PENDING") {
    return {
      ok: false,
      code: "INVALID_STATE",
      message: "Only pending events can be rejected.",
      details: { status: event.status }
    };
  }

  const updated = await prisma.event.update({
    where: { id: event.id },
    data: {
      status: "REJECTED",
      rejectionReason: params.reason,
      approvedBy: params.reviewerId,
      approvedAt: new Date()
    },
    select: {
      id: true,
      title: true,
      status: true,
      rejectionReason: true
    }
  });

  await prisma.notification.create({
    data: {
      userId: event.organizerId,
      title: "Event rejected",
      body: `${event.title} was rejected. ${updated.rejectionReason ?? ""}`.trim(),
      type: "EVENT_REJECTED",
      data: { eventId: event.id, status: "REJECTED", reason: updated.rejectionReason },
      channel: "IN_APP"
    }
  });

  await prisma.conflictLog.updateMany({
    where: {
      resolvedAt: null,
      OR: [{ newEventId: event.id }, { conflictingEventId: event.id }]
    },
    data: {
      resolvedAt: new Date(),
      resolvedBy: params.reviewerId
    }
  });

  await writeAuditLog({
    userId: params.reviewerId,
    organizationId: params.organizationId,
    action: "EVENT_REJECTED",
    resource: "event",
    resourceId: event.id,
    metadata: { title: event.title, reason: params.reason, previousStatus: "PENDING", newStatus: "REJECTED" }
  });

  return { ok: true, event: updated };
}
