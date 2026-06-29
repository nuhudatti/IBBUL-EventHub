import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess } from "@/lib/auth/rbac";
import { applyEventScopeFilter, type ScopeUser } from "@/lib/auth/scope";
import { inferScopeFromRole } from "@/lib/auth/nav";
import type { AppRole } from "@/lib/auth/rbac";
import { createEventSchema, listEventsSchema } from "@/lib/validators/event";
import { firstZodFieldMessage } from "@/lib/validators/datetime";
import { fail, ok } from "@/lib/utils/api-response";
import { detectVenueConflict } from "@/lib/events/conflict";
import { writeAuditLog } from "@/lib/server/audit";
import {
  findApproversForDepartment,
  resolveApprovalLevel
} from "@/lib/server/event-approvers";

export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  const parsed = listEventsSchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries())
  );
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Invalid query parameters.", parsed.error.flatten(), 422);
  }

  const { page, limit, status, search, conflict } = parsed.data;
  const skip = (page - 1) * limit;

  const scopeUser: ScopeUser = {
    id: session.user.id,
    role: session.user.role,
    organizationId: session.user.organizationId,
    departmentId: session.user.departmentId ?? null,
    facultyId: session.user.facultyId ?? null,
    scope: session.user.scope ?? inferScopeFromRole(session.user.role as AppRole)
  };

  let conflictIdFilter: string[] | undefined;
  if (conflict === "1") {
    const logs = await prisma.conflictLog.findMany({
      where: { resolvedAt: null, venue: { organizationId: session.user.organizationId } },
      select: { newEventId: true, conflictingEventId: true }
    });
    const set = new Set<string>();
    for (const row of logs) {
      set.add(row.newEventId);
      set.add(row.conflictingEventId);
    }
    if (set.size === 0) {
      return ok({
        items: [],
        meta: { page, limit, total: 0, totalPages: 0 }
      });
    }
    conflictIdFilter = [...set];
  }

  const where: Prisma.EventWhereInput = {
    organizationId: session.user.organizationId,
    deletedAt: null,
    ...(status ? { status } : {}),
    ...(conflictIdFilter ? { id: { in: conflictIdFilter } } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } }
          ]
        }
      : {})
  };

  await applyEventScopeFilter(where, scopeUser);

  try {
    const [rows, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: limit,
        orderBy: { startTime: "asc" },
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          startTime: true,
          endTime: true,
          venue: { select: { id: true, name: true, code: true } },
          organizer: { select: { id: true, name: true, email: true } }
        }
      }),
      prisma.event.count({ where })
    ]);

    const ids = rows.map((row) => row.id);
    const conflictPartnerByEventId = new Map<string, { id: string; title: string }>();
    if (ids.length > 0) {
      const logs = await prisma.conflictLog.findMany({
        where: {
          resolvedAt: null,
          OR: [{ newEventId: { in: ids } }, { conflictingEventId: { in: ids } }]
        },
        select: {
          newEventId: true,
          conflictingEventId: true,
          conflictingEvent: { select: { id: true, title: true } },
          newEvent: { select: { id: true, title: true } }
        }
      });
      for (const log of logs) {
        conflictPartnerByEventId.set(log.newEventId, {
          id: log.conflictingEvent.id,
          title: log.conflictingEvent.title
        });
        conflictPartnerByEventId.set(log.conflictingEventId, {
          id: log.newEvent.id,
          title: log.newEvent.title
        });
      }
    }

    const items = rows.map((row) => ({
      ...row,
      conflictPartner: conflictPartnerByEventId.get(row.id) ?? null
    }));

    return ok({
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: unknown) {
    return fail("DB_ERROR", "Failed to retrieve events.", String(error), 500);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("USER", session.user.role)) {
    return fail("FORBIDDEN", "Only users and above can create events.", undefined, 403);
  }

  const body = await request.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", firstZodFieldMessage(parsed.error), parsed.error.flatten(), 422);
  }

  try {
    const startTime = new Date(parsed.data.startTime);
    const endTime = new Date(parsed.data.endTime);
    const conflict = await detectVenueConflict({
      organizationId: session.user.organizationId,
      venueId: parsed.data.venueId,
      startTime,
      endTime
    });

    const approvalLevel = await resolveApprovalLevel(parsed.data.departmentId, session.user.organizationId);

    const baseData = {
      title: parsed.data.title,
      slug: `${parsed.data.title.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      description: parsed.data.description,
      type: parsed.data.type,
      visibility: parsed.data.visibility,
      status: "PENDING" as const,
      timezone: "Africa/Lagos",
      startTime,
      endTime,
      venueId: parsed.data.venueId,
      departmentId: parsed.data.departmentId,
      organizationId: session.user.organizationId,
      organizerId: session.user.id,
      tags: [] as string[]
    };

    let created: { id: string; title: string; status: string; startTime: Date; endTime: Date };
    try {
      created = await prisma.event.create({
        data: {
          ...baseData,
          ...(parsed.data.categoryId ? { categoryId: parsed.data.categoryId } : {}),
          approvalLevel
        },
        select: { id: true, title: true, status: true, startTime: true, endTime: true }
      });
    } catch {
      created = await prisma.event.create({
        data: baseData,
        select: { id: true, title: true, status: true, startTime: true, endTime: true }
      });
    }

    const approvers = await findApproversForDepartment({
      organizationId: session.user.organizationId,
      departmentId: parsed.data.departmentId
    });

    await prisma.notification.createMany({
      data: approvers.map((approver) => ({
        userId: approver.id,
        title: "New event pending review",
        body: `${created.title} was submitted and requires your approval.`,
        type: "EVENT_CREATED",
        data: { eventId: created.id, status: "PENDING" },
        channel: "IN_APP"
      }))
    });

    if (conflict) {
      await prisma.conflictLog.create({
        data: {
          venueId: parsed.data.venueId,
          newEventId: created.id,
          conflictingEventId: conflict.id
        }
      });

      await prisma.notification.createMany({
        data: approvers.map((approver) => ({
          userId: approver.id,
          title: "Conflict detected",
          body: `${created.title} overlaps with ${conflict.title}.`,
          type: "CONFLICT_DETECTED",
          data: { newEventId: created.id, conflictingEventId: conflict.id },
          channel: "IN_APP"
        }))
      });
    }

    await writeAuditLog({
      userId: session.user.id,
      organizationId: session.user.organizationId,
      action: "EVENT_SUBMITTED",
      resource: "event",
      resourceId: created.id,
      metadata: {
        title: created.title,
        hasConflict: Boolean(conflict),
        venueId: parsed.data.venueId,
        departmentId: parsed.data.departmentId
      }
    });

    return ok(
      { ...created, hasConflict: Boolean(conflict), conflictingTitle: conflict?.title ?? null },
      conflict
        ? "Event submitted. A venue scheduling conflict was detected and flagged for review."
        : "Event submitted for approval."
    );
  } catch (error: unknown) {
    return fail("DB_ERROR", "Failed to create event.", String(error), 500);
  }
}
