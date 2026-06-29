import { prisma } from "@/lib/db/prisma";

export interface ConflictCheckInput {
  organizationId: string;
  venueId: string;
  startTime: Date;
  endTime: Date;
  excludeEventId?: string;
}

export async function detectVenueConflict(input: ConflictCheckInput) {
  const conflictingEvent = await prisma.event.findFirst({
    where: {
      organizationId: input.organizationId,
      venueId: input.venueId,
      status: { in: ["PENDING", "APPROVED"] },
      deletedAt: null,
      ...(input.excludeEventId ? { id: { not: input.excludeEventId } } : {}),
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime }
    },
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true
    }
  });

  return conflictingEvent;
}
