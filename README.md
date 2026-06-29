# NEXUS — Campus Event Infrastructure Platform

Production-oriented monorepo scaffold for a globally deployable university event SaaS platform.

## Stack
- Next.js 14 + TypeScript strict mode
- Prisma + PostgreSQL
- Redis + BullMQ
- NextAuth v5 + RBAC middleware
- Tailwind CSS with tokenized design system
- Turborepo + pnpm workspaces

## Quick Start
1. Copy `.env.example` to `.env`.
2. Start infrastructure:
   - `docker compose up -d`
   - Postgres is on **localhost:5433** (avoids conflict with a local Windows PostgreSQL install on 5432).
3. Install dependencies:
   - `pnpm install`
4. Generate Prisma client and run migrations:
   - `pnpm --filter @nexus/web prisma:generate`
   - `pnpm --filter @nexus/web prisma:migrate`
   - `pnpm --filter @nexus/web prisma:seed`
5. Start app + worker:
   - `pnpm dev`

If `prisma generate` fails with `EPERM` on Windows, stop `pnpm dev` (file lock on the Prisma engine), then re-run generate.

## RBAC and workflow
- **Roles** (see `prisma/schema.prisma`): `SUPER_ADMIN`, `ADMIN`, `APPROVER`, `USER`, `VIEWER`
- New events are created with status `PENDING`, checked for **venue time overlap** against `PENDING` and `APPROVED` events, and **approvers** are notified. **Approve** / **reject** are `PATCH /api/v1/events/:id/approve` and `.../reject` (Zod + role checks).
- Seeded test users (password `ChangeMe123!`):
  - `super@nexus.dev` — SUPER_ADMIN
  - `admin@nexus.dev` — ADMIN
  - `approver@nexus.dev` — APPROVER
  - `user@nexus.dev` — USER (submits events)
## IBBUL presentation demo workflow
1. **System Admin** (`super@nexus.dev`) — create faculties/departments, venues, invite users.
2. **Invite lecturer** — Users → Invite user → copy invitation link → open in browser → set password.
3. **Lecturer** creates event — auto-routed to **Dr. Musa** (Computer Science department head).
4. **Approver** (`approver@nexus.dev`) — Events → approve pending item.
5. **Student** (`viewer@nexus.dev`) — sees approved event + notification + calendar update.

After pulling schema changes, restart dev server: stop `pnpm dev`, run `pnpm --filter @nexus/web prisma:generate`, then `pnpm dev` again.

## Apps
- `apps/web`: Next.js application (UI + API)
- `apps/worker`: BullMQ worker process
- `packages/shared-types`: shared contracts
