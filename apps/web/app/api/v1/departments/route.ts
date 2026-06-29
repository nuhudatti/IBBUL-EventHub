import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess } from "@/lib/auth/rbac";
import { prisma } from "@/lib/db/prisma";
import { createDepartmentSchema } from "@/lib/validators/department";
import { firstZodFieldMessage } from "@/lib/validators/datetime";
import { fail, ok } from "@/lib/utils/api-response";
import { writeAuditLog } from "@/lib/server/audit";

/**
 * List departments in the current organization (faculties and departments via parentId).
 */
export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("USER", session.user.role)) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  try {
    const items = await prisma.department.findMany({
      where: { organizationId: session.user.organizationId, deletedAt: null },
      orderBy: [{ parentId: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        parentId: true,
        parent: { select: { id: true, name: true } },
        children: {
          where: { deletedAt: null },
          select: { id: true, name: true, slug: true },
          orderBy: { name: "asc" }
        }
      }
    });
    return ok(items);
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not load departments.", String(error), 500);
  }
}

/**
 * Create a faculty or department (System / University administrators).
 */
export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Only administrators can manage departments.", undefined, 403);
  }

  const body = await request.json();
  const parsed = createDepartmentSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", firstZodFieldMessage(parsed.error), parsed.error.flatten(), 422);
  }

  try {
    if (parsed.data.parentId) {
      const parent = await prisma.department.findFirst({
        where: {
          id: parsed.data.parentId,
          organizationId: session.user.organizationId,
          deletedAt: null
        }
      });
      if (!parent) {
        return fail("VALIDATION_ERROR", "Parent faculty not found.", undefined, 422);
      }
    }

    const created = await prisma.department.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        color: parsed.data.color,
        parentId: parsed.data.parentId,
        organizationId: session.user.organizationId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        parentId: true
      }
    });

    await writeAuditLog({
      userId: session.user.id,
      organizationId: session.user.organizationId,
      action: parsed.data.parentId ? "DEPARTMENT_CREATED" : "FACULTY_CREATED",
      resource: "department",
      resourceId: created.id,
      metadata: { name: created.name, parentId: created.parentId }
    });

    return ok(created, parsed.data.parentId ? "Department created." : "Faculty created.");
  } catch (error: unknown) {
    return fail("DB_ERROR", "Could not create department.", String(error), 500);
  }
}
