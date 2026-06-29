import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export async function writeAuditLog(params: {
  userId: string;
  organizationId: string;
  action: string;
  resource: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      organizationId: params.organizationId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      ...(params.metadata !== undefined
        ? { metadata: params.metadata as Prisma.InputJsonValue }
        : {})
    }
  });
}
