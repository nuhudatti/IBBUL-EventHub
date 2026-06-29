import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { canAccess, hasAnyRole, type AppRole } from "@/lib/auth/rbac";
import { inferScopeFromRole } from "@/lib/auth/nav";
import { getRoleDisplayName } from "@/lib/auth/role-labels";
import { invitationEmail } from "@/lib/email/templates/messages";
import { sendMail } from "@/lib/email/send";
import { fail, ok } from "@/lib/utils/api-response";
import { inviteUserSchema } from "@/lib/validators/user";
import { firstZodFieldMessage } from "@/lib/validators/datetime";
import { createUserInvitation } from "@/lib/server/invitation";
export async function POST(request: NextRequest): Promise<Response> {
  const session = await auth();
  if (!session?.user || !canAccess("ADMIN", session.user.role)) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const actorRole = session.user.role as AppRole;
  if (!hasAnyRole(actorRole, ["SUPER_ADMIN", "ADMIN"])) {
    return fail("FORBIDDEN", "Administrator access required.", undefined, 403);
  }

  const body = await request.json();
  const parsed = inviteUserSchema.safeParse(body);
  if (!parsed.success) {
    return fail("VALIDATION_ERROR", firstZodFieldMessage(parsed.error), parsed.error.flatten(), 422);
  }

  if (parsed.data.role === "SUPER_ADMIN" && actorRole !== "SUPER_ADMIN") {
    return fail("FORBIDDEN", "Only a system administrator can invite another system administrator.", undefined, 403);
  }

  const scope = inferScopeFromRole(parsed.data.role);

  try {
    const baseUrl = process.env.NEXTAUTH_URL ?? request.nextUrl.origin;
    const result = await createUserInvitation({
      organizationId: session.user.organizationId,
      invitedById: session.user.id,
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      departmentId: parsed.data.departmentId ?? null,
      facultyId: parsed.data.facultyId ?? null,
      scope,
      baseUrl
    });

    const mail = invitationEmail({
      recipientName: parsed.data.name,
      role: parsed.data.role,
      inviteUrl: result.inviteUrl,
      expiresAt: result.expiresAt
    });

    const mailResult = await sendMail({
      to: parsed.data.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      tags: ["invitation", parsed.data.role.toLowerCase()]
    });

    if (!mailResult.ok) {
      return fail(
        "MAIL_ERROR",
        `User created but email failed: ${mailResult.error}. Share this link manually: ${result.inviteUrl}`,
        { inviteUrl: result.inviteUrl },
        502
      );
    }

    return ok(
      {
        userId: result.userId,
        email: result.email,
        inviteUrl: result.inviteUrl,
        expiresAt: result.expiresAt.toISOString(),
        roleLabel: getRoleDisplayName(parsed.data.role),
        emailSent: true,
        emailPreview: "preview" in mailResult && mailResult.preview ? true : false
      },
      "preview" in mailResult && mailResult.preview
        ? "Invitation created. SMTP not configured — copy the link below or check server console."
        : `Invitation email sent to ${parsed.data.email} as ${getRoleDisplayName(parsed.data.role)}.`
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Could not send invitation.";
    return fail("INVITE_ERROR", message, undefined, 400);
  }
}
