import { NextRequest } from "next/server";
import { z } from "zod";
import { getAppBaseUrl } from "@/lib/email/config";
import { passwordResetEmail } from "@/lib/email/templates/messages";
import { sendMail } from "@/lib/email/send";
import { createPasswordResetToken } from "@/lib/server/password-reset";
import { fail, ok } from "@/lib/utils/api-response";
import { prisma } from "@/lib/db/prisma";

const schema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest): Promise<Response> {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", "Enter a valid email address.", parsed.error.flatten(), 422);
  }

  const email = parsed.data.email.trim().toLowerCase();

  // Always return success message to prevent email enumeration in UI
  const genericMessage =
    "If an account exists with this email, we have sent password reset instructions to your inbox.";

  try {
    const tokenResult = await createPasswordResetToken(email);
    if (!tokenResult) {
      return ok({ sent: false }, genericMessage);
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { name: true }
    });

    const baseUrl = getAppBaseUrl();
    const resetUrl = `${baseUrl}/reset-password?email=${encodeURIComponent(email)}&token=${tokenResult.token}`;
    const mail = passwordResetEmail({
      recipientName: user?.name ?? "Colleague",
      resetUrl,
      expiresAt: tokenResult.expiresAt
    });

    const result = await sendMail({
      to: email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      tags: ["password-reset"]
    });

    if (!result.ok) {
      return fail("MAIL_ERROR", `Could not send email: ${result.error}`, undefined, 502);
    }

    return ok(
      {
        sent: true,
        preview: "preview" in result && result.preview ? true : false,
        previewReason: "preview" in result && result.preview ? result.reason : undefined
      },
      genericMessage
    );
  } catch (error: unknown) {
    return fail("SERVER_ERROR", error instanceof Error ? error.message : "Request failed.", undefined, 500);
  }
}
