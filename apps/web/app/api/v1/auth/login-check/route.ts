import { NextRequest } from "next/server";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { fail, ok } from "@/lib/utils/api-response";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

/**
 * Returns a specific, user-friendly login error before NextAuth sign-in.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Enter a valid email address.", parsed.error.flatten(), 422);
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, password: true, status: true, deletedAt: true, name: true }
  });

  if (!user || user.deletedAt) {
    return fail(
      "USER_NOT_FOUND",
      "No account exists with this email. Contact your administrator or use the invitation link you received.",
      undefined,
      404
    );
  }

  if (user.status === "PENDING") {
    return fail(
      "ACCOUNT_PENDING",
      "Your account is not activated yet. Open the invitation email and set your password first.",
      undefined,
      403
    );
  }

  if (user.status === "SUSPENDED") {
    return fail(
      "ACCOUNT_SUSPENDED",
      "This account has been deactivated. Contact the university administrator.",
      undefined,
      403
    );
  }

  if (!user.password) {
    return fail(
      "NO_PASSWORD",
      "No password is set for this account. Use your invitation link to activate your account.",
      undefined,
      403
    );
  }

  const valid = await compare(parsed.data.password, user.password);
  if (!valid) {
    return fail("INVALID_PASSWORD", "Incorrect password. Try again or use Forgot password.", undefined, 401);
  }

  return ok({ email: user.email, name: user.name }, "Credentials valid.");
}
