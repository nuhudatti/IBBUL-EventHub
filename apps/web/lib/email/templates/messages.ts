import { getRoleDisplayName } from "@/lib/auth/role-labels";
import type { UserRole } from "@prisma/client";
import { ibbulEmailLayout } from "@/lib/email/templates/layout";

export function invitationEmail(params: {
  recipientName: string;
  role: UserRole;
  inviteUrl: string;
  expiresAt: Date;
}): { subject: string; html: string; text: string } {
  const roleLabel = getRoleDisplayName(params.role);
  const subject = `IBBUL Event Platform — Your ${roleLabel} account invitation`;

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#FFFFFF;font-size:17px;font-weight:600;">Welcome, ${params.recipientName}</p>
    <p style="margin:0 0 16px;">You have been invited to join the <strong style="color:#D4AF37;">IBBUL University Event Scheduling &amp; Notification System</strong> as:</p>
    <p style="margin:0 0 20px;padding:14px 18px;background:#132D50;border-left:4px solid #D4AF37;border-radius:6px;color:#F5E6B8;font-weight:600;">${roleLabel}</p>
    <p style="margin:0 0 12px;">Click the button below to create your password and activate your account. This link expires on <strong>${params.expiresAt.toLocaleDateString("en-NG", { dateStyle: "long" })}</strong>.</p>
    <p style="margin:0;color:#8FA3BF;font-size:13px;">For security, do not share this link. If you did not expect this invitation, contact the university ICT office.</p>
  `;

  const html = ibbulEmailLayout({
    preheader: `Activate your IBBUL ${roleLabel} account`,
    title: subject,
    bodyHtml,
    ctaLabel: "Activate my account",
    ctaUrl: params.inviteUrl
  });

  const text = `IBBUL Event Platform — Account Invitation

Welcome, ${params.recipientName}

You have been invited as: ${roleLabel}

Activate your account: ${params.inviteUrl}

Expires: ${params.expiresAt.toISOString()}

Learning for Service — Ibrahim Badamasi Babangida University, Lapai`;

  return { subject, html, text };
}

export function passwordResetEmail(params: {
  recipientName: string;
  resetUrl: string;
  expiresAt: Date;
}): { subject: string; html: string; text: string } {
  const subject = "IBBUL Event Platform — Reset your password";

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#FFFFFF;font-size:17px;font-weight:600;">Hello, ${params.recipientName}</p>
    <p style="margin:0 0 16px;">We received a request to reset the password for your IBBUL Event Platform account.</p>
    <p style="margin:0 0 12px;">Use the button below to choose a new password. This link expires on <strong>${params.expiresAt.toLocaleDateString("en-NG", { dateStyle: "long" })}</strong>.</p>
    <p style="margin:0;color:#8FA3BF;font-size:13px;">If you did not request this, you can safely ignore this email — your password will not change.</p>
  `;

  const html = ibbulEmailLayout({
    preheader: "Reset your IBBUL Event Platform password",
    title: subject,
    bodyHtml,
    ctaLabel: "Reset password",
    ctaUrl: params.resetUrl
  });

  const text = `IBBUL Event Platform — Password Reset

Hello, ${params.recipientName}

Reset your password: ${params.resetUrl}

Expires: ${params.expiresAt.toISOString()}

Learning for Service — IBBUL, Lapai`;

  return { subject, html, text };
}
