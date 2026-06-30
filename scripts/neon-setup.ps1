# One-time Neon production setup for IBBUL Event Hub
# Usage:
#   1. Open Neon dashboard → your project → Connection details
#   2. Copy "Direct" and "Pooled" connection strings (NOT channel_binding=require)
#   3. Run: .\scripts\neon-setup.ps1
# Or pass URLs:
#   .\scripts\neon-setup.ps1 -DirectUrl "postgresql://..." -PooledUrl "postgresql://..."

param(
  [string]$DirectUrl = $env:NEON_DIRECT_URL,
  [string]$PooledUrl = $env:NEON_POOLED_URL
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$web = Join-Path $root "apps\web"

if (-not $DirectUrl) {
  $DirectUrl = Read-Host "Paste Neon DIRECT connection string (host without -pooler)"
}
if (-not $PooledUrl) {
  $PooledUrl = Read-Host "Paste Neon POOLED connection string (host with -pooler)"
}

# Strip channel_binding — breaks Prisma on Windows
$DirectUrl = $DirectUrl -replace "&channel_binding=require", "" -replace "\?channel_binding=require&", "?" -replace "\?channel_binding=require", ""
$PooledUrl = $PooledUrl -replace "&channel_binding=require", "" -replace "\?channel_binding=require&", "?" -replace "\?channel_binding=require", ""

if ($PooledUrl -notmatch "pgbouncer=true") {
  if ($PooledUrl -match "\?") { $PooledUrl += "&pgbouncer=true" } else { $PooledUrl += "?pgbouncer=true" }
}

Write-Host "Waking Neon (connect_timeout)..." -ForegroundColor Cyan
$env:DIRECT_DATABASE_URL = $DirectUrl
$env:DATABASE_URL = $DirectUrl

Push-Location $web
try {
  npx prisma db execute --stdin --url $DirectUrl 2>$null | Out-Null
} catch { }

Write-Host "Pushing schema to Neon (db push)..." -ForegroundColor Cyan
npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
  Write-Host "db push failed. Open Neon dashboard and confirm the project is Active (not suspended)." -ForegroundColor Red
  exit 1
}

Write-Host "Seeding demo users..." -ForegroundColor Cyan
npx tsx prisma/seed.ts
if ($LASTEXITCODE -ne 0) { exit 1 }

Write-Host ""
Write-Host "SUCCESS. Set these in Vercel → Environment Variables (Production):" -ForegroundColor Green
Write-Host "DATABASE_URL = (pooled URL with pgbouncer=true)"
Write-Host "DIRECT_DATABASE_URL = (direct URL) — optional on Vercel; required for future migrations"
Write-Host "NEXTAUTH_URL = https://ibbul-event-hub.vercel.app"
Write-Host "NEXTAUTH_SECRET = (random 32+ chars)"
Write-Host "REDIS_URL = redis://localhost:6379 (or Upstash URL)"
Write-Host ""
Write-Host "Login: admin@nexus.dev / ChangeMe123!"
} finally {
  Pop-Location
}
