# IBBUL University Platform — Migration Report

**Date:** 26 May 2026  
**Scope:** Non-breaking refactor for Ibrahim Badamasi Babangida University (IBBUL) deployment  
**Migration:** `20260526120000_ibbul_university_extensions`

---

## Summary

The platform was extended from a generic RBAC event system into an academic organizational model suitable for IBBUL **without** replacing authentication, breaking existing APIs, or renaming permission enums.

---

## New database tables

| Table | Purpose |
|-------|---------|
| `Building` | Physical buildings linked to organization (optional department) |
| `EventCategory` | Configurable event categories per organization (Seminar, Lecture, etc.) |

---

## New fields

### Organization
- `tagline`, `address`, `website` — university profile metadata

### User
- `scope` (`UserScope` enum, default `DEPARTMENT`) — organizational visibility
- `facultyId` — optional link to top-level faculty (`Department` with no parent)

### Venue
- `buildingId` — optional FK to `Building` (legacy `building` string retained)

### Event
- `categoryId` — optional FK to `EventCategory`
- `approvalLevel` (`ApprovalLevel` enum, default `DEPARTMENT`)

---

## New enums

| Enum | Values |
|------|--------|
| `UserScope` | `UNIVERSITY`, `FACULTY`, `DEPARTMENT`, `PUBLIC` |
| `ApprovalLevel` | `DEPARTMENT`, `FACULTY`, `UNIVERSITY` |

**Unchanged:** `UserRole`, `EventStatus`, `EventType` (backward compatible)

---

## Updated relationships

- `User.faculty` → `Department` (faculty level unit)
- `Department` hierarchy: `parentId` = faculty → department tree
- `Building` → `Organization`, optional `Department`
- `Venue.buildingRel` → `Building`
- `Event.category` → `EventCategory`

---

## Permission model (unchanged enums, new display names)

| Internal role | IBBUL display name |
|---------------|-------------------|
| `SUPER_ADMIN` | System Administrator |
| `ADMIN` | University Administrator |
| `APPROVER` | Event Approval Officer |
| `USER` | Event Creator (Lecturer/Staff) |
| `VIEWER` | Student / Guest |

Implementation: `apps/web/lib/auth/role-labels.ts`

---

## Scope model

| Scope | Typical user | Event visibility |
|-------|--------------|------------------|
| `UNIVERSITY` | System / University Admin | All organization events |
| `FACULTY` | Faculty Event Officer | Faculty + child departments |
| `DEPARTMENT` | Lecturer, dept officer | Own events (USER) or department (APPROVER) |
| `PUBLIC` | Student / Guest | Approved events only |

Implementation: `apps/web/lib/auth/scope.ts` — applied in `GET /api/v1/events`

---

## Approval flow

- Event form includes **Approval Level**: Department / Faculty / University
- Stored on `Event.approvalLevel` (configurable metadata for routing)
- Existing approve/reject workflow unchanged (`PENDING` → `APPROVED` / `REJECTED`)
- Conflict detection still runs on create and blocks approval when venue overlap exists

---

## Bug fixes in this release

### Event creation — "Invalid event payload"
**Root cause:** Server required description ≥ 10 characters and strict ISO datetime; UI did not validate or show field errors.

**Fix:**
- Lenient datetime parsing (`datetime-local` + ISO)
- Clear validation messages from API
- Client-side checks before submit
- Send raw datetime-local values (server normalizes)

### Conflict detection UX
**Fix:** Create response includes `hasConflict` and `conflictingTitle`; UI shows warning toast when overlap is detected (event still saved as `PENDING` for approver review).

---

## New / updated APIs

| Endpoint | Change |
|----------|--------|
| `GET /api/v1/event-categories` | **New** — list categories |
| `GET /api/v1/departments` | Returns hierarchy (`parent`, `children`) |
| `POST /api/v1/departments` | **New** — admin create faculty/department |
| `POST /api/v1/events` | Categories, approval level, audit log, better errors |
| `GET /api/v1/events` | Scope-based filtering |

---

## Audit logging

Writes to existing `AuditLog` table on:
- Event submitted
- Event approved
- Event rejected
- Faculty/department created

Implementation: `apps/web/lib/server/audit.ts`

---

## Seed data (IBBUL)

After migration, run:

```bash
pnpm --filter @nexus/web prisma:seed
```

Includes:
- IBBUL organization profile
- Faculties: Science, Arts & Social Sciences
- Departments: Computer Science, Mathematics, Mass Communication
- Buildings: Senate Building, University Library
- Venues: Senate Chamber Hall, ICT Lecture Theatre
- 12 event categories
- Demo users with scopes (password: `ChangeMe123!`)

---

## Breaking changes

**None intentional.** Existing records remain valid with defaults:
- Users default to `scope = DEPARTMENT`
- Events default to `approvalLevel = DEPARTMENT`
- `EventType` enum unchanged; categories are additive

---

## Deployment checklist (IBBUL)

1. Set `DATABASE_URL` (production PostgreSQL)
2. Run `pnpm --filter @nexus/web exec prisma migrate deploy`
3. Run `pnpm --filter @nexus/web prisma:seed` (first deploy only)
4. Set strong `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
5. Restart app after env changes
6. Log in as `super@nexus.dev` / `ChangeMe123!` and verify event create + conflict flow

---

## Future-ready (not in this pass)

- Email/SMS notification worker (schema supports channels)
- PDF/Excel report export UI
- Full audit log dashboard page
- Published / Completed / Archived status extensions
- Multi-university tenant switcher

---

## Files changed (reference)

- `apps/web/prisma/schema.prisma`
- `apps/web/prisma/seed.ts`
- `apps/web/lib/validators/event.ts`, `datetime.ts`
- `apps/web/lib/auth/role-labels.ts`, `scope.ts`
- `apps/web/lib/server/audit.ts`, `event-review.ts`
- `apps/web/app/api/v1/events/route.ts`
- `apps/web/app/api/v1/departments/route.ts`
- `apps/web/app/api/v1/event-categories/route.ts`
- `apps/web/app/(dashboard)/events/page.tsx`
- `apps/web/app/(dashboard)/departments/page.tsx`
