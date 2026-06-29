import { addDays, subDays, subMonths } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";

/**
 * Operational summary for control-center dashboards (approvers and above get full alerts).
 */
export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("VIEWER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  const orgId = session.user.organizationId;
  const role = session.user.role as AppRole;
  const fullOps = hasAnyRole(role, ["SUPER_ADMIN", "ADMIN", "APPROVER"]);

  try {
    const now = new Date();
    const from90 = subDays(now, 90);
    const from180 = subDays(now, 180);
    const monthStart = subMonths(now, 1);
    const horizon = addDays(now, 30);

    const [
      totalEvents,
      eventsThisMonth,
      approvedUpcoming,
      pendingApprovals,
      unresolvedConflicts,
      suspendedUsers,
      recentEventsForHours,
      venueBookingGroups,
      venuesBase,
      departments,
      deptIdsWithRecentEvents
    ] = await Promise.all([
      prisma.event.count({ where: { organizationId: orgId, deletedAt: null } }),
      prisma.event.count({
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: monthStart } }
      }),
      prisma.event.count({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: "APPROVED",
          startTime: { gte: now }
        }
      }),
      fullOps
        ? prisma.event.count({
            where: { organizationId: orgId, deletedAt: null, status: "PENDING" }
          })
        : Promise.resolve(0),
      fullOps
        ? prisma.conflictLog.count({
            where: { resolvedAt: null, venue: { organizationId: orgId } }
          })
        : Promise.resolve(0),
      fullOps
        ? prisma.user.count({
            where: { organizationId: orgId, deletedAt: null, status: "SUSPENDED" }
          })
        : Promise.resolve(0),
      prisma.event.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { in: ["APPROVED", "PENDING"] },
          startTime: { gte: from90 }
        },
        select: { startTime: true }
      }),
      prisma.event.groupBy({
        by: ["venueId"],
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { in: ["APPROVED", "PENDING"] },
          startTime: { lt: horizon },
          endTime: { gt: now }
        },
        _count: { id: true }
      }),
      prisma.venue.findMany({
        where: { organizationId: orgId, deletedAt: null, isActive: true },
        select: { id: true, name: true, capacity: true }
      }),
      prisma.department.findMany({
        where: { organizationId: orgId, deletedAt: null },
        select: { id: true, name: true, slug: true }
      }),
      prisma.event.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          startTime: { gte: from180 }
        },
        distinct: ["departmentId"],
        select: { departmentId: true }
      })
    ]);

    const hourBuckets = new Array(24).fill(0);
    for (const row of recentEventsForHours) {
      const h = row.startTime.getUTCHours();
      hourBuckets[h] += 1;
    }
    let peakHour = 0;
    let peakCount = 0;
    hourBuckets.forEach((c, h) => {
      if (c > peakCount) {
        peakCount = c;
        peakHour = h;
      }
    });

    const activeDeptIds = new Set(
      deptIdsWithRecentEvents.map((d) => d.departmentId).filter((id): id is string => Boolean(id))
    );
    const inactiveDepartments = departments
      .filter((d) => !activeDeptIds.has(d.id))
      .map((d) => ({ id: d.id, name: d.name }));

    const countByVenue = new Map(venueBookingGroups.map((g) => [g.venueId, g._count.id]));
    let overUtilizedVenue: { venueId: string; name: string; score: number; bookingCount: number } | null = null;
    let bestScore = -1;
    for (const v of venuesBase) {
      const bookingCount = countByVenue.get(v.id) ?? 0;
      const cap = v.capacity && v.capacity > 0 ? v.capacity : 200;
      const score = Math.min(100, Math.round((bookingCount * 24) / cap));
      if (score > bestScore && bookingCount > 0) {
        bestScore = score;
        overUtilizedVenue = { venueId: v.id, name: v.name, score, bookingCount };
      }
    }
    if (overUtilizedVenue && overUtilizedVenue.score < 35) {
      overUtilizedVenue = null;
    }

    const systemWarnings: string[] = [];
    if (fullOps && suspendedUsers > 0) {
      systemWarnings.push(`${suspendedUsers} suspended user account(s) require review.`);
    }
    if (fullOps && unresolvedConflicts > 0) {
      systemWarnings.push(`${unresolvedConflicts} unresolved scheduling conflict log(s).`);
    }

    const peakBookingHour =
      peakCount > 0
        ? {
            hour: peakHour,
            label: `${String(peakHour).padStart(2, "0")}:00–${String((peakHour + 1) % 24).padStart(2, "0")}:00 UTC`,
            eventCount: peakCount
          }
        : null;

    return ok({
      role,
      alerts: fullOps
        ? {
            unresolvedConflicts,
            pendingApprovals,
            suspendedUsers,
            systemWarnings
          }
        : {
            unresolvedConflicts: 0,
            pendingApprovals: 0,
            suspendedUsers: 0,
            systemWarnings: [] as string[]
          },
      insights: {
        peakBookingHour,
        overUtilizedVenue,
        inactiveDepartments: inactiveDepartments.slice(0, 8)
      },
      kpis: {
        totalEvents,
        approvedUpcoming,
        eventsThisMonth
      }
    });
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load dashboard summary.", String(error), 500);
  }
}
