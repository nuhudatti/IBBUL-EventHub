import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { firstZodFieldMessage } from "@/lib/validators/datetime";
import { fail, ok } from "@/lib/utils/api-response";
import { resetPasswordWithToken } from "@/lib/server/password-reset";
import { z } from "zod";

const resetSchema = z.object({
  email: z.string().email(),
  token: z.string().min(16),
  password: z.string().min(8).max(128)
});

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json();
  const parsed = resetSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", firstZodFieldMessage(parsed.error), parsed.error.flatten(), 422);
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    await resetPasswordWithToken({
      email: parsed.data.email.trim().toLowerCase(),
      token: parsed.data.token,
      passwordHash
    });
    return ok({ success: true }, "Password updated. You can now sign in.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not reset password.";
    return fail("RESET_ERROR", message, undefined, 400);
  }
}

// Re-export accept invite schema alias for consistency — accept-invite uses separate route
