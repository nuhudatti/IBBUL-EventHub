import { NextRequest } from "next/server";
import { addDays } from "date-fns";
import { auth } from "@/lib/auth";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { createVenueSchema } from "@/lib/validators/user";
import { firstZodFieldMessage } from "@/lib/validators/datetime";
import { fail, ok } from "@/lib/utils/api-response";
import { writeAuditLog } from "@/lib/server/audit";
type BaseVenue = { id: string; name: string; code: string; capacity: number | null };

/**
 * List active venues. `?intelligence=1` adds booking/conflict signals (approver+).
 */
export async function GET(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("USER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  const role = session.user.role as AppRole;
  const intelligence = request.nextUrl.searchParams.get("intelligence") === "1";
  const withIntel = intelligence && hasAnyRole(role, ["SUPER_ADMIN", "ADMIN", "APPROVER"]);

  try {
    const venues: BaseVenue[] = await prisma.venue.findMany({
      where: { organizationId: session.user.organizationId, deletedAt: null, isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, capacity: true }
    });

    if (!withIntel) {
      return ok(venues);
    }

    const now = new Date();
    const horizon = addDays(now, 30);

    const [bookingGroups, conflictGroups] = await Promise.all([
      prisma.event.groupBy({
        by: ["venueId"],
        where: {
          organizationId: session.user.organizationId,
          deletedAt: null,
          status: { in: ["APPROVED", "PENDING"] },
          startTime: { lt: horizon },
          endTime: { gt: now }
        },
        _count: { id: true }
      }),
      prisma.conflictLog.groupBy({
        by: ["venueId"],
        where: { resolvedAt: null, venue: { organizationId: session.user.organizationId } },
        _count: { id: true }
      })
    ]);

    const bookingMap = new Map(bookingGroups.map((g) => [g.venueId, g._count.id]));
    const conflictMap = new Map(conflictGroups.map((g) => [g.venueId, g._count.id]));

    const enriched = venues.map((v) => {
      const bookingCount = bookingMap.get(v.id) ?? 0;
      const cap = v.capacity && v.capacity > 0 ? v.capacity : 200;
      const utilizationScore = Math.min(100, Math.round((bookingCount * 24) / cap));
      const unresolvedConflicts = conflictMap.get(v.id) ?? 0;
      return {
        ...v,
        bookingCountNext30d: bookingCount,
        utilizationScore,
        unresolvedConflicts,
        isOverbookedSignal: unresolvedConflicts > 0 || utilizationScore >= 85
      };
    });

    return ok(enriched);
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load venues.", String(error), 500);
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const body = await request.json();
  const parsed = createVenueSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", firstZodFieldMessage(parsed.error), parsed.error.flatten(), 422);
  }

  try {
    const created = await prisma.venue.create({
      data: {
        name: parsed.data.name,
        code: parsed.data.code.toUpperCase(),
        description: parsed.data.description,
        building: parsed.data.building,
        capacity: parsed.data.capacity,
        organizationId: session.user.organizationId,
        images: []
      },
      select: { id: true, name: true, code: true, capacity: true }
    });

    await writeAuditLog({
      userId: session.user.id,
      organizationId: session.user.organizationId,
      action: "VENUE_CREATED",
      resource: "venue",
      resourceId: created.id,
      metadata: { name: created.name, code: created.code }
    });

    return ok(created, "Venue created.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not create venue.", String(error), 500);
  }
}
