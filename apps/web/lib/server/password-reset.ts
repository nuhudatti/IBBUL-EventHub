import { randomBytes } from "crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/db/prisma";

const RESET_PREFIX = "password-reset:";

export async function createPasswordResetToken(email: string): Promise<{ token: string; expiresAt: Date; userId: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, deletedAt: true, status: true, password: true }
  });

  if (!user || user.deletedAt || user.status === "SUSPENDED" || !user.password) {
    return null;
  }

  await prisma.verificationToken.deleteMany({
    where: { identifier: `${RESET_PREFIX}${email}` }
  });

  const token = randomBytes(32).toString("hex");
  const expiresAt = addHours(new Date(), 2);

  await prisma.verificationToken.create({
    data: {
      identifier: `${RESET_PREFIX}${email}`,
      token,
      expires: expiresAt
    }
  });

  return { token, expiresAt, userId: user.id };
}

export async function resetPasswordWithToken(params: {
  email: string;
  token: string;
  passwordHash: string;
}): Promise<void> {
  const record = await prisma.verificationToken.findFirst({
    where: {
      identifier: `${RESET_PREFIX}${params.email}`,
      token: params.token
    }
  });

  if (!record || record.expires < new Date()) {
    throw new Error("Reset link is invalid or has expired.");
  }

  const user = await prisma.user.findUnique({ where: { email: params.email } });
  if (!user || user.deletedAt) {
    throw new Error("Account not found.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: params.passwordHash }
  });

  await prisma.verificationToken.delete({
    where: { identifier_token: { identifier: record.identifier, token: record.token } }
  });
}
