# IBBUL Event Platform — Deployment & Email Guide

**System:** University Event Scheduling & Notification System  
**Institution:** Ibrahim Badamasi Babangida University, Lapai  
**Motto:** *Learning for Service*

---

## 1. What was delivered

| Feature | Status |
|---------|--------|
| IBBUL-branded login (gate background + logo + navy/gold) | Ready |
| Specific login errors (no account, wrong password, pending, suspended) | Ready |
| User invitation emails (role + IBBUL branding) | Ready |
| Forgot password + reset password emails | Ready |
| Accept-invite / reset-password pages (matching brand) | Ready |

Assets live in: `apps/web/public/branding/`
- `ibbul-gate.jpg` — login background
- `ibbul-logo.png` — university logo

---

## 2. Environment variables (required)

Copy `.env.example` to `.env` and `apps/web/.env`:

```env
DATABASE_URL="postgresql://nexus:nexus@localhost:5433/nexus_dev?schema=public"
NEXTAUTH_SECRET="<generate-32+-char-random-string>"
NEXTAUTH_URL="https://your-production-domain.edu.ng"

MAIL_ENABLED="true"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="IBBUL Event Platform <your-email@gmail.com>"
SMTP_REPLY_TO="events@ibbul.edu.ng"
```

### Generate NEXTAUTH_SECRET (PowerShell)

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 3. SMTP setup options (real inbox delivery)

### Option A — Gmail (quick demo / FYP)

1. Enable **2-Step Verification** on the Google account.
2. Create an **App Password**: Google Account → Security → App passwords.
3. Use:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your@gmail.com`
   - `SMTP_PASS=16-char-app-password`
   - `SMTP_FROM="IBBUL Event Platform <your@gmail.com>"`

### Option B — University domain (best for production)

Use your ICT office SMTP relay, e.g.:

```env
SMTP_HOST=mail.ibbul.edu.ng
SMTP_PORT=587
SMTP_USER=noreply@ibbul.edu.ng
SMTP_PASS=<ict-provided-password>
SMTP_FROM="IBBUL Event Platform <noreply@ibbul.edu.ng>"
```

Ask ICT to configure **SPF**, **DKIM**, and **DMARC** for your sending domain — this is the main factor for inbox vs spam.

### Option C — SendGrid / Mailgun / Brevo

Use their SMTP credentials; set `SMTP_FROM` to a verified sender domain.

---

## 4. Avoid spam folder (checklist)

1. **Use a real From address** on your domain (`SMTP_FROM`).
2. **Set SPF record** on DNS: allow your SMTP server to send for `@ibbul.edu.ng`.
3. **Enable DKIM** signing (provider or ICT).
4. **Do not use** `Precedence: bulk` on transactional mail (already removed in code).
5. **Include plain-text** part (already included).
6. **Warm up** new sender addresses — send a few test invites to yourself first.
7. **NEXTAUTH_URL** must match your public URL exactly (links in emails depend on this).

---

## 5. Local development

```powershell
docker compose up -d
pnpm install
pnpm --filter @nexus/web prisma:generate
pnpm --filter @nexus/web prisma:seed
pnpm dev
```

Open: `http://localhost:3000/login`

If SMTP is **not** configured, emails are **previewed in the server console** (terminal running `pnpm dev`).

---

## 6. Deploy to Vercel (monorepo)

This repo is a **pnpm + Turbo monorepo**. Only `apps/web` deploys to Vercel (the worker is not needed on Vercel).

### Vercel project settings

| Setting | Value |
|---------|--------|
| **Root Directory** | `apps/web` |
| **Framework Preset** | Next.js |
| **Include source files outside Root Directory** | **Enabled** (required) |
| **Install Command** | **Override OFF** — or exactly: `cd ../.. && corepack enable && pnpm install --frozen-lockfile` |
| **Build Command** | **Override OFF** — or exactly: `cd ../.. && pnpm vercel-build` |
| **Output Directory** | *(leave empty — do not set `.next` manually)* |
| **Development Command** | *(leave default)* |
| **Production Branch** | `main` (or your default branch) |

**Do not use `npm run vercel-build`.** This repo uses **pnpm** (`packageManager: pnpm@10.0.0`). If Vercel runs npm, install fails and you see `node_modules missing` and Prisma `pnpm add` errors.

If you previously set custom Install/Build commands in the Vercel dashboard, **clear them** (toggle Override off) so `apps/web/vercel.json` is used, or paste the exact commands above.

**Important:** `pnpm-lock.yaml` must be committed to git (it is not gitignored). Vercel uses `--frozen-lockfile`; without the lockfile in the repo, install always fails.

### Environment variables on Vercel

Add these in **Project → Settings → Environment Variables**:

- `DATABASE_URL` — Neon/Supabase/Railway PostgreSQL URL
- `NEXTAUTH_SECRET` — random 32+ char string
- `NEXTAUTH_URL` — `https://your-app.vercel.app` (exact production URL)
- `MAIL_ENABLED`, `SMTP_*` — for invitation/reset emails

### After deploy

Verify the deployment URL from the Vercel dashboard (**Deployments → latest → Visit**) before using the custom domain. If you see `DEPLOYMENT_NOT_FOUND`, the domain is not linked to a live production deployment — see troubleshooting below.

```bash
pnpm --filter @nexus/web exec prisma migrate deploy
pnpm --filter @nexus/web prisma:seed   # first time only
```

Or run migrations from Neon SQL console / local machine against production `DATABASE_URL`.

### Fix `404 DEPLOYMENT_NOT_FOUND` on `*.vercel.app`

This is a **Vercel domain/deployment** issue, not a missing `/login` page in the app.

1. Open **Vercel → your project → Deployments**.
2. Find the latest deployment with status **Ready** (green).
3. Click **Visit** on that deployment. If this URL works but `ibbul-eventhub.vercel.app` does not, go to step 4.
4. **Settings → Domains** — confirm `ibbul-eventhub.vercel.app` is listed under **this** project (not an old/deleted project).
5. On the latest Ready deployment, open **⋯ → Promote to Production** (if it is not already Production).
6. **Settings → Git → Production Branch** must match your branch (e.g. `main`).
7. Clear **Output Directory** override (must be empty for Next.js).
8. Redeploy: **Deployments → Redeploy** on the latest commit.

Required **Environment Variables** (Production): `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` = `https://ibbul-eventhub.vercel.app`, `REDIS_URL`.

### Common Vercel errors

| Error | Fix |
|-------|-----|
| `next: command not found` | Enable **Include source files outside Root Directory**; Root Directory = `apps/web`; use pnpm install from root |
| `node_modules missing` | Do not use npm — use pnpm install from repo root (see `vercel.json`) |
| `pnpm add @prisma/client` during build | Fix `@prisma/client` version in `apps/web/package.json` (must not be empty); run install before build |
| `npm run vercel-build` failed | Remove npm build override; use `cd ../.. && pnpm vercel-build` |
| `ERR_PNPM_FROZEN_LOCKFILE_WITH_OUTDATED_LOCKFILE` | Commit `pnpm-lock.yaml` to git (remove from `.gitignore`), push, redeploy |
| Prisma client error on build | `build` script runs `prisma generate` — redeploy after pulling latest |

---

## 7. Production deployment steps (VPS / self-hosted)

1. **Database** — PostgreSQL (Neon, Railway, or university server). Set `DATABASE_URL`.
2. **Run migrations:**
   ```bash
   pnpm --filter @nexus/web exec prisma migrate deploy
   pnpm --filter @nexus/web prisma:seed   # first time only
   ```
3. **Build & start:**
   ```bash
   pnpm --filter @nexus/web build
   pnpm --filter @nexus/web start
   ```
4. **Set env** on host (Vercel, Railway, VPS): all vars from section 2.
5. **HTTPS** required for production cookies and email links.
6. **Restart** after env changes.

---

## 7. Test email delivery

### Invitation flow
1. Login as `super@nexus.dev` / `ChangeMe123!`
2. Users → Invite user → real email you control
3. Check inbox for **"IBBUL Event Platform — Your … account invitation"**
4. Click **Activate my account** → set password → login

### Forgot password flow
1. Go to `/forgot-password`
2. Enter email of an **active** user with password set
3. Check inbox for **"Reset your password"**
4. Open link → `/reset-password?email=...&token=...`
5. Set new password → login

---

## 8. Login error messages (user-facing)

| Situation | Message |
|-----------|---------|
| Email not in database | No account exists with this email… |
| Wrong password | Incorrect password. Try again or use Forgot password. |
| Invitation not accepted | Your account is not activated yet… |
| Account deactivated | This account has been deactivated… |
| No password set | Use your invitation link to activate… |

---

## 9. FYP presentation demo script

1. Show **IBBUL login page** (branding + Learning for Service)
2. **System Admin** → invite lecturer → show email on phone/laptop
3. Lecturer activates account via email link
4. Lecturer creates event → **Dr. Musa** approves
5. Student sees event + notification

Demo accounts (password `ChangeMe123!`): see login page → "Show FYP demo accounts"

---

## 10. Troubleshooting

| Problem | Fix |
|---------|-----|
| `Unexpected end of JSON input` | Restart dev server; run `prisma generate` |
| Email not sending | Check `MAIL_ENABLED=true`, SMTP credentials, terminal for `[IBBUL mail error]` |
| Email in spam | Use university domain + SPF/DKIM; mark as "Not spam" once |
| Reset link expired | Links expire in **2 hours**; request again |
| Invite link expired | Links expire in **7 days**; re-invite user |
| Login still fails after seed | Log out; use exact demo email; password `ChangeMe123!` |

---

## 11. Files reference

| Path | Purpose |
|------|---------|
| `lib/email/send.ts` | SMTP delivery |
| `lib/email/templates/messages.ts` | Invitation + reset HTML |
| `lib/server/invitation.ts` | Invite tokens |
| `lib/server/password-reset.ts` | Reset tokens |
| `app/api/v1/auth/login-check/route.ts` | Specific login errors |
| `app/api/v1/auth/forgot-password/route.ts` | Send reset email |
| `components/auth/ibbul-auth-shell.tsx` | Shared auth UI |

---

*Prepared for Final Year Project presentation — IBBUL, Lapai.*
