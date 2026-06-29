-- Migrate UserRole: ORGANIZER/MEMBER -> USER, add APPROVER/VIEWER
CREATE TYPE "UserRole_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'APPROVER', 'USER', 'VIEWER');

ALTER TABLE "User" ADD COLUMN "role_migrated" "UserRole_new" NOT NULL DEFAULT 'USER';

UPDATE "User" SET "role_migrated" = CASE "role"::text
  WHEN 'SUPER_ADMIN' THEN 'SUPER_ADMIN'::"UserRole_new"
  WHEN 'ADMIN' THEN 'ADMIN'::"UserRole_new"
  WHEN 'ORGANIZER' THEN 'USER'::"UserRole_new"
  WHEN 'MEMBER' THEN 'USER'::"UserRole_new"
  ELSE 'USER'::"UserRole_new"
END;

ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" RENAME COLUMN "role_migrated" TO "role";
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER'::"UserRole_new";
DROP TYPE "UserRole";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";

-- Migrate EventStatus: PENDING_APPROVAL -> PENDING, remove COMPLETED (map to APPROVED)
CREATE TYPE "EventStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

ALTER TABLE "Event" ADD COLUMN "status_migrated" "EventStatus_new" NOT NULL DEFAULT 'DRAFT';

UPDATE "Event" SET "status_migrated" = CASE "status"::text
  WHEN 'DRAFT' THEN 'DRAFT'::"EventStatus_new"
  WHEN 'PENDING_APPROVAL' THEN 'PENDING'::"EventStatus_new"
  WHEN 'PENDING' THEN 'PENDING'::"EventStatus_new"
  WHEN 'APPROVED' THEN 'APPROVED'::"EventStatus_new"
  WHEN 'REJECTED' THEN 'REJECTED'::"EventStatus_new"
  WHEN 'CANCELLED' THEN 'CANCELLED'::"EventStatus_new"
  WHEN 'COMPLETED' THEN 'APPROVED'::"EventStatus_new"
  ELSE 'DRAFT'::"EventStatus_new"
END;

ALTER TABLE "Event" DROP COLUMN "status";
ALTER TABLE "Event" RENAME COLUMN "status_migrated" TO "status";
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"EventStatus_new";
DROP TYPE "EventStatus";
ALTER TYPE "EventStatus_new" RENAME TO "EventStatus";
