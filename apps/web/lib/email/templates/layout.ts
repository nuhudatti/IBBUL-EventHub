/** IBBUL email shell — dark navy + creamy gold, inbox-friendly HTML. */
export function ibbulEmailLayout(params: {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}): string {
  const ctaBlock =
    params.ctaLabel && params.ctaUrl
      ? `<tr>
          <td style="padding:28px 32px 8px;text-align:center;">
            <a href="${params.ctaUrl}" style="display:inline-block;background:linear-gradient(135deg,#D4AF37 0%,#F5E6B8 50%,#C9A227 100%);color:#0B1F3A;font-weight:700;font-size:15px;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.3px;">
              ${params.ctaLabel}
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 32px 0;text-align:center;font-size:12px;color:#8FA3BF;line-height:1.5;">
            Or copy this link:<br/>
            <span style="color:#D4AF37;word-break:break-all;">${params.ctaUrl}</span>
          </td>
        </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
  <title>${params.title}</title>
</head>
<body style="margin:0;padding:0;background:#E8ECF1;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <span style="display:none;max-height:0;overflow:hidden;">${params.preheader}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#E8ECF1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#0B1F3A;border-radius:16px;overflow:hidden;border:1px solid #1A3A5C;">
          <tr>
            <td style="background:linear-gradient(135deg,#0B1F3A 0%,#132D50 100%);padding:32px;text-align:center;border-bottom:3px solid #D4AF37;">
              <p style="margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#D4AF37;">Ibrahim Badamasi Babangida University</p>
              <h1 style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;line-height:1.3;">Event Scheduling &amp; Notification System</h1>
              <p style="margin:12px 0 0;font-size:14px;font-style:italic;color:#F5E6B8;">Learning for Service</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#E2EAF4;font-size:15px;line-height:1.65;">
              ${params.bodyHtml}
            </td>
          </tr>
          ${ctaBlock}
          <tr>
            <td style="padding:24px 32px 32px;text-align:center;border-top:1px solid #1A3A5C;">
              <p style="margin:0;font-size:12px;color:#8FA3BF;line-height:1.5;">
                ${params.footerNote ?? "This message was sent by the IBBUL Event Platform, Lapai, Niger State."}<br/>
                &copy; ${new Date().getFullYear()} Ibrahim Badamasi Babangida University
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
