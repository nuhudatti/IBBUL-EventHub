/** Minimal RFC 5545-ish .ics for common calendar apps. */

function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatDateUtc(d: Date): string {
  const p = (n: number) => n.toString().padStart(2, "0");
  return (
    d.getUTCFullYear().toString() +
    p(d.getUTCMonth() + 1) +
    p(d.getUTCDate()) +
    "T" +
    p(d.getUTCHours()) +
    p(d.getUTCMinutes()) +
    p(d.getUTCSeconds()) +
    "Z"
  );
}

export type IcsEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string | null;
};

export function buildIcs(calendarName: string, events: IcsEvent[]): string {
  const now = new Date();
  const stamp = formatDateUtc(now);
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Campus Event Platform//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calendarName)}`
  ];
  for (const e of events) {
    const start = new Date(e.start);
    const end = new Date(e.end);
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@ceip-calendar`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${formatDateUtc(start)}`,
      `DTEND:${formatDateUtc(end)}`,
      `SUMMARY:${escapeText(e.title)}`
    );
    if (e.location) {
      lines.push(`LOCATION:${escapeText(e.location)}`);
    }
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}

export function downloadIcsFile(filename: string, body: string): void {
  const blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
