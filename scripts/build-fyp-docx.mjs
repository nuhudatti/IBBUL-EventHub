/**
 * Builds print-ready FYP-Final-Submission-IBBUL.docx from markdown.
 * Run: node scripts/build-fyp-docx.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { convertMarkdownToBuffer } from "@mohtasham/md-to-docx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "FYP-Final-Submission-IBBUL.md");
const outputPath = path.join(root, "FYP-Final-Submission-IBBUL.docx");

function preprocessMarkdown(raw) {
  let md = raw;

  // Remove developer package header block
  md = md.replace(/^# FINAL YEAR PROJECT — PRINT & SUBMISSION PACKAGE[\s\S]*?^---\s*\n/m, "");

  // Strip HTML wrappers used for centering in markdown preview
  md = md.replace(/<div align="center">/gi, "");
  md = md.replace(/<\/div>/gi, "");
  md = md.replace(/<br\s*\/?>/gi, "\n\n");
  md = md.replace(/&nbsp;/g, " ");

  // Replace mermaid blocks with printable figure notes
  md = md.replace(/```mermaid[\s\S]*?```/g, (block) => {
    const captionMatch = block.match(/Figure\s+[\d.]+[^`\n]*/i);
    const note = captionMatch
      ? `[Diagram: ${captionMatch[0].trim()} — export PNG from fyp-diagrams/ folder and insert here before printing.]`
      : "[Diagram — insert exported PNG from fyp-diagrams/ folder before printing.]";
    return `\n\n${note}\n\n`;
  });

  // Broken image refs → placeholder text
  md = md.replace(
    /!\[([^\]]*)\]\(fyp-diagrams\/screenshots\/[^)]+\)/g,
    "\n\n**[$1]** — Insert screenshot PNG from `fyp-diagrams/screenshots/` before printing.\n\n"
  );

  // Normalize excessive blank lines
  md = md.replace(/\n{4,}/g, "\n\n\n");

  return md.trim();
}

const raw = await fs.readFile(inputPath, "utf8");
const markdown = preprocessMarkdown(raw);

const buffer = await convertMarkdownToBuffer(markdown, {
  documentOptions: {
    title: "University Event Scheduling and Notification System — IBBUL FYP",
    creator: "IBBUL Computer Science Final Year Project",
    description: "Design and Implementation FYP Report"
  },
  style: {
    defaultFont: "Times New Roman",
    fontSize: 24, // half-points → 12pt
    lineSpacing: 1.5,
    paragraphAlignment: "JUSTIFIED",
    heading1: {
      font: "Times New Roman",
      size: 28,
      bold: true,
      alignment: "CENTER"
    },
    heading2: {
      font: "Times New Roman",
      size: 24,
      bold: true
    },
    heading3: {
      font: "Times New Roman",
      size: 24,
      bold: true
    }
  },
  page: {
    margin: {
      top: 1440,
      right: 1440,
      bottom: 1440,
      left: 1440
    }
  }
});

await fs.writeFile(outputPath, buffer);
console.log(`Created: ${outputPath}`);
console.log(`Size: ${(buffer.length / 1024).toFixed(1)} KB`);
console.log("Open in Microsoft Word or upload to Google Drive → Open with Google Docs.");
