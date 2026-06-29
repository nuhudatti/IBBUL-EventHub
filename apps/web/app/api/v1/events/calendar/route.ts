import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";
import { z } from "zod";

const querySchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime()
});

/**
 * Events overlapping a time window for calendar views (FullCalendar, etc.).
 */
export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams.entries()));
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Provide start and end as ISO datetimes.", parsed.error.flatten(), 422);
  }

  const start = new Date(parsed.data.start);
  const end = new Date(parsed.data.end);
  if (end <= start) {
    return fail("VALIDATION_ERROR", "end must be after start.", undefined, 422);
  }

  const orgId = session.user.organizationId;
  const userRole = session.user.role as AppRole;

  const where: Prisma.EventWhereInput = {
    organizationId: orgId,
    deletedAt: null,
    AND: [{ endTime: { gt: start } }, { startTime: { lt: end } }]
  };

  if (userRole === "VIEWER") {
    where.status = "APPROVED";
  } else if (!hasAnyRole(userRole, ["SUPER_ADMIN", "ADMIN", "APPROVER"])) {
    where.organizerId = session.user.id;
  }

  try {
    const rows = await prisma.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      select: {
        id: true,
        title: true,
        status: true,
        startTime: true,
        endTime: true,
        venueId: true,
        venue: { select: { id: true, name: true, code: true } }
      }
    });

    const ids = rows.map((r) => r.id);
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

    const events = rows.map((row) => ({
      id: row.id,
      title: row.title,
      start: row.startTime.toISOString(),
      end: row.endTime.toISOString(),
      status: row.status,
      venueId: row.venueId,
      venueName: row.venue?.name ?? null,
      conflictPartner: conflictPartnerByEventId.get(row.id) ?? null
    }));

    return ok({ events });
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load calendar events.", String(error), 500);
  }
}
