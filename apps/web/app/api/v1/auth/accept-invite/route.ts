import { NextRequest } from "next/server";
import { hash } from "bcryptjs";
import { acceptInviteSchema } from "@/lib/validators/user";
import { firstZodFieldMessage } from "@/lib/validators/datetime";
import { fail, ok } from "@/lib/utils/api-response";
import { acceptInvitation } from "@/lib/server/invitation";

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json();
  const parsed = acceptInviteSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", firstZodFieldMessage(parsed.error), parsed.error.flatten(), 422);
  }

  try {
    const passwordHash = await hash(parsed.data.password, 12);
    const result = await acceptInvitation({
      email: parsed.data.email,
      token: parsed.data.token,
      passwordHash
    });
    return ok(result, "Account activated. You can now sign in.");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not activate account.";
    return fail("INVITE_ERROR", message, undefined, 400);
  }
}
