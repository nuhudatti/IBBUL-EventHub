import { eachWeekOfInterval, endOfWeek, startOfWeek, subWeeks } from "date-fns";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { fail, ok } from "@/lib/utils/api-response";

const WEEKS = 12;

/**
 * Organization analytics for dashboards (SUPER_ADMIN / ADMIN).
 */
export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Admin access required.", undefined, 403);
  }

  const role = session.user.role as AppRole;
  if (!hasAnyRole(role, ["SUPER_ADMIN", "ADMIN"])) {
    return fail("FORBIDDEN", "Admin access required.", undefined, 403);
  }

  const orgId = session.user.organizationId;

  try {
    const now = new Date();
    const weekStartNow = startOfWeek(now, { weekStartsOn: 1 });
    const rangeStart = subWeeks(weekStartNow, WEEKS - 1);

    const [eventsInRange, deptGroups, venueGroups, hourBuckets] = await Promise.all([
      prisma.event.findMany({
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: rangeStart } },
        select: { id: true, createdAt: true, status: true, departmentId: true, venueId: true, startTime: true }
      }),
      prisma.event.groupBy({
        by: ["departmentId"],
        where: { organizationId: orgId, deletedAt: null, createdAt: { gte: rangeStart } },
        _count: { id: true }
      }),
      prisma.event.groupBy({
        by: ["venueId"],
        where: {
          organizationId: orgId,
          deletedAt: null,
          createdAt: { gte: rangeStart },
          status: { in: ["APPROVED", "PENDING"] }
        },
        _count: { id: true }
      }),
      prisma.event.findMany({
        where: {
          organizationId: orgId,
          deletedAt: null,
          status: { in: ["APPROVED", "PENDING"] },
          startTime: { gte: subWeeks(now, 26) }
        },
        select: { startTime: true }
      })
    ]);

    const weekStarts = eachWeekOfInterval({ start: rangeStart, end: weekStartNow }, { weekStartsOn: 1 });
    const eventsOverTime = weekStarts.map((ws) => {
      const we = endOfWeek(ws, { weekStartsOn: 1 });
      const count = eventsInRange.filter((e) => e.createdAt >= ws && e.createdAt <= we).length;
      return { weekStart: ws.toISOString(), weekEnd: we.toISOString(), count };
    });

    const departments = await prisma.department.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, name: true }
    });
    const deptMap = new Map(
      deptGroups
        .filter((g): g is (typeof g & { departmentId: string }) => g.departmentId !== null)
        .map((g) => [g.departmentId, g._count.id])
    );
    const departmentActivity = departments
      .map((d) => ({
        id: d.id,
        name: d.name,
        eventCount: deptMap.get(d.id) ?? 0
      }))
      .sort((a, b) => b.eventCount - a.eventCount);

    const venues = await prisma.venue.findMany({
      where: { organizationId: orgId, deletedAt: null },
      select: { id: true, name: true, capacity: true }
    });
    const venueMap = new Map(venueGroups.map((g) => [g.venueId, g._count.id]));
    const totalVenueEvents = [...venueMap.values()].reduce((a, b) => a + b, 0) || 1;
    const venueUtilization = venues
      .map((v) => {
        const c = venueMap.get(v.id) ?? 0;
        const pct = Math.round((c / totalVenueEvents) * 100);
        return { id: v.id, name: v.name, sharePercent: pct, eventCount: c };
      })
      .sort((a, b) => b.eventCount - a.eventCount);

    const hours = new Array(24).fill(0);
    for (const e of hourBuckets) {
      hours[e.startTime.getUTCHours()] += 1;
    }

    return ok({
      eventsOverTime,
      departmentActivity,
      venueUtilization,
      peakBookingHoursUtc: hours.map((count, hour) => ({ hour, count }))
    });
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load analytics.", String(error), 500);
  }
}
