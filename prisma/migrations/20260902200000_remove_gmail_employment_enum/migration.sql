-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'FIXED_TERM', 'APPRENTICESHIP', 'INTERNSHIP', 'FREELANCE', 'PART_TIME');

-- AlterEnum
BEGIN;
CREATE TYPE "ApplicationSource_new" AS ENUM ('MANUAL', 'APPLYPILOT');
ALTER TABLE "public"."applications" ALTER COLUMN "source" DROP DEFAULT;
ALTER TABLE "applications" ALTER COLUMN "source" TYPE "ApplicationSource_new" USING ("source"::text::"ApplicationSource_new");
ALTER TYPE "ApplicationSource" RENAME TO "ApplicationSource_old";
ALTER TYPE "ApplicationSource_new" RENAME TO "ApplicationSource";
DROP TYPE "public"."ApplicationSource_old";
ALTER TABLE "applications" ALTER COLUMN "source" SET DEFAULT 'MANUAL';
COMMIT;

-- DropForeignKey
ALTER TABLE "email_imports" DROP CONSTRAINT "email_imports_applicationId_fkey";

-- DropForeignKey
ALTER TABLE "email_imports" DROP CONSTRAINT "email_imports_userId_fkey";

-- DropForeignKey
ALTER TABLE "gmail_connections" DROP CONSTRAINT "gmail_connections_userId_fkey";

-- DropIndex
DROP INDEX "applications_userId_sourceEmailId_idx";

-- DropIndex
DROP INDEX "applications_userId_sourceEmailId_key";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "sourceEmailId",
DROP COLUMN "employmentType",
ADD COLUMN     "employmentType" "EmploymentType";

-- DropTable
DROP TABLE "email_imports";

-- DropTable
DROP TABLE "gmail_connections";

-- DropEnum
DROP TYPE "DetectionConfidence";

-- DropEnum
DROP TYPE "EmailImportState";

-- CreateIndex
CREATE INDEX "applications_userId_employmentType_idx" ON "applications"("userId", "employmentType");
