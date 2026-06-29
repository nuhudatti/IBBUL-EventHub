# How to Submit This Project as Google Docs / Word (Print-Ready)

This folder contains your **complete final year project package**. Follow these steps to produce a bound, printable document for IBB University, Lapai.

---

## Files in This Package

| File | Purpose |
|------|---------|
| `FYP-Final-Submission-IBBUL.md` | **Main report** — paste into Google Docs or Word |
| `fyp-diagrams/*.mmd` | Mermaid source for all figures |
| `fyp-diagrams/FYP-Diagrams.drawio` | Editable diagrams (draw.io / diagrams.net) |
| `FYP-Screenshots-Checklist.md` | List of screenshots to capture from the running app |

---

## Step 1 — Export Diagrams as Images

Google Docs and Word **do not render Mermaid** directly. Export each diagram as PNG.

### Option A — Mermaid Live (recommended for `.mmd` files)

1. Open https://mermaid.live  
2. Open any file from `fyp-diagrams/` (e.g. `01-system-architecture.mmd`)  
3. Copy-paste the contents into the editor  
4. Click **Actions → PNG** (or SVG)  
5. Save as `Figure-3-1-System-Architecture.png` (use names from the report)  
6. Repeat for all `.mmd` files

### Option B — draw.io (recommended for formal ER / architecture)

1. Open https://app.diagrams.net  
2. **File → Open from → Device** → select `fyp-diagrams/FYP-Diagrams.drawio`  
3. Switch tabs at the bottom (System Architecture, ER Diagram, Approval Flowchart)  
4. **File → Export as → PNG** (300 DPI for print)  
5. Save each page with the figure number from the report

---

## Step 2 — Create Google Doc

1. Go to https://docs.google.com  
2. **Blank document**  
3. Open `FYP-Final-Submission-IBBUL.md` in VS Code  
4. Select all → Copy  
5. Paste into Google Docs  

### Apply formatting (required by most CS departments)

| Element | Setting |
|---------|---------|
| Body text | Times New Roman, 12pt |
| Line spacing | 1.5 |
| Alignment | Justified |
| Margins | 2.54 cm (1 inch) all sides |
| Chapter titles | Bold, 14pt, Centred |
| Section headings (1.1) | Bold, 12pt, Left |

**Page numbers:** Insert → Page numbers → bottom centre

**Table of Contents:** After formatting headings, use Insert → Table of contents (if using Google Docs heading styles, apply Heading 1 to chapter titles first)

---

## Step 3 — Replace Personal Placeholders

Search and replace in the document:

- `[STUDENT ONE FULL NAME]`
- `[STUDENT TWO FULL NAME]`
- `[UG__/CS/____]` (matric numbers)
- `[SUPERVISOR NAME]`
- `[MONTH, YEAR]` → e.g. `May, 2026`

---

## Step 4 — Insert Diagrams and Screenshots

Where the report says **Figure X.X**, insert the exported PNG:

1. Place cursor at the figure location  
2. **Insert → Image → Upload from computer**  
3. Centre the image  
4. Add caption below: *Figure 3.1: System Architecture Diagram*  

Capture app screenshots per `FYP-Screenshots-Checklist.md` while `pnpm dev` is running.

---

## Step 5 — Final Checks Before Printing

- [ ] Title page complete with both student names  
- [ ] Certification page has signature lines  
- [ ] All 7+ figures inserted  
- [ ] All 7 screenshots inserted (Chapter 4)  
- [ ] References on separate page  
- [ ] Appendices included  
- [ ] Spell-check run  
- [ ] Plagiarism check (if required by department)  
- [ ] Print preview — no orphan headings at page bottom  

---

## Step 6 — Download for Binding

**Google Docs:** File → Download → Microsoft Word (.docx) or PDF  
**Print:** Use PDF for professional binding at a print shop near campus  

---

## Alternative — Microsoft Word

1. File → Open → select `FYP-Final-Submission-IBBUL.md` (Word 2019+ opens Markdown)  
2. Or paste from VS Code as in Step 2  
3. References → Table of Contents → Automatic  
4. Same formatting as above  

---

## Diagram File Quick Reference

| Figure | Source file |
|--------|-------------|
| 3.1 System Architecture | `fyp-diagrams/01-system-architecture.mmd` or draw.io page 1 |
| 3.2 ER Diagram | `fyp-diagrams/02-er-diagram.mmd` or draw.io page 2 |
| 3.3 Use Case | `fyp-diagrams/03-use-case.mmd` |
| 3.4 Activity / Approval | `fyp-diagrams/04-activity-approval.mmd` or draw.io page 3 |
| 3.5 Data Flow | `fyp-diagrams/05-dfd-event-creation.mmd` |
| 4.x Sequence (optional) | `fyp-diagrams/06-sequence-approve.mmd` |
| Deployment (optional) | `fyp-diagrams/07-deployment.mmd` |

---

*Department of Computer Science — Ibrahim Badamasi Babangida University, Lapai*
