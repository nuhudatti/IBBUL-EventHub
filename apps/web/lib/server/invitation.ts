import { randomBytes } from "crypto";
import { addDays } from "date-fns";
import { prisma } from "@/lib/db/prisma";

export type InvitationResult = {
  userId: string;
  email: string;
  inviteUrl: string;
  expiresAt: Date;
};

/**
 * Creates a pending user and invitation token. Administrator never sets a password.
 */
export async function createUserInvitation(params: {
  organizationId: string;
  invitedById: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "APPROVER" | "USER" | "VIEWER";
  departmentId?: string | null;
  facultyId?: string | null;
  scope?: "UNIVERSITY" | "FACULTY" | "DEPARTMENT" | "PUBLIC";
  baseUrl: string;
}): Promise<InvitationResult> {
  const existing = await prisma.user.findUnique({ where: { email: params.email } });
  if (existing && existing.deletedAt === null) {
    throw new Error("A user with this email already exists.");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = addDays(new Date(), 7);

  let user: { id: string; email: string };
  try {
    user = await prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        password: null,
        role: params.role,
        status: "PENDING",
        organizationId: params.organizationId,
        departmentId: params.departmentId ?? null,
        facultyId: params.facultyId ?? null,
        scope: params.scope ?? "DEPARTMENT"
      },
      select: { id: true, email: true }
    });
  } catch {
    user = await prisma.user.create({
      data: {
        email: params.email,
        name: params.name,
        password: null,
        role: params.role,
        status: "PENDING",
        organizationId: params.organizationId,
        departmentId: params.departmentId ?? null
      },
      select: { id: true, email: true }
    });
  }

  await prisma.verificationToken.create({
    data: {
      identifier: params.email,
      token,
      expires: expiresAt
    }
  });

  const inviteUrl = `${params.baseUrl.replace(/\/$/, "")}/accept-invite?email=${encodeURIComponent(params.email)}&token=${token}`;

  await prisma.auditLog.create({
    data: {
      userId: params.invitedById,
      organizationId: params.organizationId,
      action: "USER_INVITED",
      resource: "user",
      resourceId: user.id,
      metadata: { email: params.email, role: params.role, inviteUrl }
    }
  });

  return { userId: user.id, email: user.email, inviteUrl, expiresAt };
}

export async function acceptInvitation(params: {
  email: string;
  token: string;
  passwordHash: string;
}): Promise<{ userId: string }> {
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: params.email, token: params.token }
  });

  if (!record || record.expires < new Date()) {
    throw new Error("Invitation link is invalid or has expired.");
  }

  const user = await prisma.user.findUnique({ where: { email: params.email } });
  if (!user || user.deletedAt) {
    throw new Error("User account not found.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: params.passwordHash,
      status: "ACTIVE"
    }
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: params.email, token: params.token } }
  });

  return { userId: user.id };
}
