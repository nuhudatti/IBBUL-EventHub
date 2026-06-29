# Screenshot Checklist for Chapter 4

Run the application before capturing screenshots:

```powershell
docker compose up -d
pnpm dev
```

Open http://localhost:3000 and capture at **1920×1080** or full-screen. Save PNG files in `fyp-diagrams/screenshots/`.

| Figure | Page URL | Login as | What to show |
|--------|----------|----------|--------------|
| 4.1 Login | `/login` | (none) | Login form with demo account buttons visible |
| 4.2 Dashboard | `/dashboard` | `admin@nexus.dev` | KPI cards and summary widgets |
| 4.3 Create Event | `/events` | `user@nexus.dev` | Open "Create event" form filled with sample data |
| 4.4 Events List | `/events` | `approver@nexus.dev` | Pending event with Approve/Reject buttons |
| 4.5 Calendar | `/calendar` | `approver@nexus.dev` | Month view with coloured events |
| 4.6 Notifications | `/notifications` | `approver@nexus.dev` | Inbox with unread messages |
| 4.7 Analytics | `/analytics` | `admin@nexus.dev` | Charts visible |

**Password for all test accounts:** `ChangeMe123!`

### Optional extra screenshots

| Figure | Page | Account |
|--------|------|---------|
| 4.8 Venues | `/venues` | `user@nexus.dev` |
| 4.9 Users | `/users` | `admin@nexus.dev` |
| 4.10 Calendar Week | `/calendar` | switch to week view |

### Naming convention

```
Figure-4-1-Login.png
Figure-4-2-Dashboard.png
...
```

Insert into `FYP-Final-Submission-IBBUL.md` locations marked Figure 4.x after export to Word/Google Docs.
