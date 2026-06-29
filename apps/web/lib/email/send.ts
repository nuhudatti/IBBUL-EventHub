import nodemailer from "nodemailer";
import { getMailConfig } from "@/lib/email/config";

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  tags?: string[];
};

export type SendMailResult =
  | { ok: true; messageId: string; preview?: false }
  | { ok: true; messageId: string; preview: true; reason: string }
  | { ok: false; error: string };

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  const cfg = getMailConfig();
  transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.pass },
    tls: { minVersion: "TLSv1.2" }
  });
  return transporter;
}

/**
 * Sends transactional email with deliverability-friendly headers.
 * Falls back to console preview when SMTP is not configured (dev).
 */
export async function sendMail(input: SendMailInput): Promise<SendMailResult> {
  const cfg = getMailConfig();

  if (!cfg.enabled) {
    console.info("[IBBUL mail preview]", {
      to: input.to,
      subject: input.subject,
      text: input.text.slice(0, 200)
    });
    return { ok: true, messageId: "preview-dev", preview: true, reason: "SMTP not configured — logged to server console" };
  }

  try {
    const info = await getTransporter().sendMail({
      from: cfg.from,
      replyTo: cfg.replyTo,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      headers: {
        "X-Mailer": "IBBUL-Event-Platform",
        "X-Priority": "3",
        ...(input.tags?.length ? { "X-Entity-Ref-ID": input.tags.join("-") } : {})
      }
    });

    return { ok: true, messageId: info.messageId };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Mail delivery failed";
    console.error("[IBBUL mail error]", message);
    return { ok: false, error: message };
  }
}

/** Verify SMTP connection — useful for admin health checks. */
export async function verifyMailConnection(): Promise<{ ok: boolean; message: string }> {
  const cfg = getMailConfig();
  if (!cfg.enabled) {
    return { ok: false, message: "SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env" };
  }
  try {
    await getTransporter().verify();
    return { ok: true, message: `Connected to ${cfg.host}:${cfg.port}` };
  } catch (error: unknown) {
    return { ok: false, message: error instanceof Error ? error.message : "SMTP verification failed" };
  }
}
