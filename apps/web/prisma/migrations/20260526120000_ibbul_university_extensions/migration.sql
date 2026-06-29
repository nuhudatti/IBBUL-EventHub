-- IBBUL university extensions (non-breaking)

CREATE TYPE "UserScope" AS ENUM ('UNIVERSITY', 'FACULTY', 'DEPARTMENT', 'PUBLIC');
CREATE TYPE "ApprovalLevel" AS ENUM ('DEPARTMENT', 'FACULTY', 'UNIVERSITY');

ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "tagline" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Organization" ADD COLUMN IF NOT EXISTS "website" TEXT;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "scope" "UserScope" NOT NULL DEFAULT 'DEPARTMENT';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "facultyId" TEXT;

ALTER TABLE "Venue" ADD COLUMN IF NOT EXISTS "buildingId" TEXT;

ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "categoryId" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "approvalLevel" "ApprovalLevel" NOT NULL DEFAULT 'DEPARTMENT';

CREATE TABLE IF NOT EXISTS "Building" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "departmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EventCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Building_organizationId_code_key" ON "Building"("organizationId", "code");
CREATE INDEX IF NOT EXISTS "Building_organizationId_departmentId_idx" ON "Building"("organizationId", "departmentId");

CREATE UNIQUE INDEX IF NOT EXISTS "EventCategory_organizationId_slug_key" ON "EventCategory"("organizationId", "slug");
CREATE INDEX IF NOT EXISTS "EventCategory_organizationId_isActive_idx" ON "EventCategory"("organizationId", "isActive");

ALTER TABLE "User" ADD CONSTRAINT "User_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Building" ADD CONSTRAINT "Building_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Building" ADD CONSTRAINT "Building_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Venue" ADD CONSTRAINT "Venue_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Event" ADD CONSTRAINT "Event_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "EventCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
