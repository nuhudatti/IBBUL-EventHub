export type MailConfig = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
  replyTo: string;
};

export function getMailConfig(): MailConfig {
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return {
    enabled: process.env.MAIL_ENABLED !== "false" && Boolean(process.env.SMTP_HOST && process.env.SMTP_USER),
    host: process.env.SMTP_HOST ?? "",
    port,
    secure,
    user: process.env.SMTP_USER ?? "",
    pass: process.env.SMTP_PASS ?? "",
    from: process.env.SMTP_FROM ?? "IBBUL Event Platform <noreply@ibbul.edu.ng>",
    replyTo: process.env.SMTP_REPLY_TO ?? process.env.SMTP_USER ?? "events@ibbul.edu.ng"
  };
}

export function getAppBaseUrl(): string {
  return (process.env.NEXTAUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
}
