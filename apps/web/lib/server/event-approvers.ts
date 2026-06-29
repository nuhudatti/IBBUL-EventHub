import { prisma } from "@/lib/db/prisma";
import type { ApprovalLevel } from "@prisma/client";

/**
 * Resolves approvers for an event based on department assignment (headId) and faculty scope.
 * No manual approver selection required at event creation.
 */
export async function findApproversForDepartment(params: {
  organizationId: string;
  departmentId: string;
}): Promise<Array<{ id: string; name: string }>> {
  const department = await prisma.department.findFirst({
    where: {
      id: params.departmentId,
      organizationId: params.organizationId,
      deletedAt: null
    },
    select: {
      id: true,
      parentId: true,
      headId: true,
      head: { select: { id: true, name: true, role: true, status: true } }
    }
  });

  if (!department) {
    return fallbackAdmins(params.organizationId);
  }

  if (
    department.headId &&
    department.head &&
    department.head.status === "ACTIVE" &&
    ["APPROVER", "ADMIN", "SUPER_ADMIN"].includes(department.head.role)
  ) {
    return [{ id: department.head.id, name: department.head.name }];
  }

  const scopedApprovers = await prisma.user.findMany({
    where: {
      organizationId: params.organizationId,
      deletedAt: null,
      status: "ACTIVE",
      role: "APPROVER",
      OR: [
        { departmentId: department.id },
        ...(department.parentId ? [{ departmentId: department.parentId }] : [])
      ]
    },
    select: { id: true, name: true },
    take: 5
  });

  if (scopedApprovers.length > 0) {
    return scopedApprovers;
  }

  return fallbackAdmins(params.organizationId);
}

async function fallbackAdmins(organizationId: string): Promise<Array<{ id: string; name: string }>> {
  return prisma.user.findMany({
    where: {
      organizationId,
      deletedAt: null,
      status: "ACTIVE",
      role: { in: ["ADMIN", "SUPER_ADMIN"] }
    },
    select: { id: true, name: true },
    take: 3
  });
}

export async function resolveApprovalLevel(departmentId: string, organizationId: string): Promise<ApprovalLevel> {
  const department = await prisma.department.findFirst({
    where: { id: departmentId, organizationId, deletedAt: null },
    select: { parentId: true }
  });
  if (!department) return "DEPARTMENT";
  return department.parentId ? "DEPARTMENT" : "FACULTY";
}

export async function notifyStudentsOfApprovedEvent(params: {
  organizationId: string;
  eventId: string;
  title: string;
}): Promise<void> {
  const students = await prisma.user.findMany({
    where: {
      organizationId: params.organizationId,
      deletedAt: null,
      status: "ACTIVE",
      role: "VIEWER"
    },
    select: { id: true }
  });

  if (students.length === 0) return;

  await prisma.notification.createMany({
    data: students.map((student) => ({
      userId: student.id,
      title: "New upcoming event",
      body: `${params.title} is now published on the university calendar.`,
      type: "EVENT_APPROVED",
      data: { eventId: params.eventId, status: "APPROVED" },
      channel: "IN_APP"
    }))
  });
}
