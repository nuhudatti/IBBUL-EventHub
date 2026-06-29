import { hash } from "bcryptjs";
import { NextRequest } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api-response";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return fail("VALIDATION_ERROR", "Invalid registration payload.", parsed.error.flatten(), 422);
    }

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return fail("CONFLICT", "Email is already in use.", undefined, 409);
    }

    const defaultOrg = await prisma.organization.findFirst({
      where: { slug: "global-university" }
    });
    if (!defaultOrg) {
      return fail("SETUP_REQUIRED", "Organization seed data not found.", undefined, 500);
    }

    const password = await hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password,
        role: "USER",
        status: "PENDING",
        organizationId: defaultOrg.id
      },
      select: { id: true, name: true, email: true }
    });

    return ok(user, "Registration successful.");
  } catch (error: unknown) {
    return fail("INTERNAL_ERROR", "Unexpected registration error.", String(error), 500);
  }
}
