-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('ONSITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('MANUAL', 'APPLYPILOT', 'GMAIL');

-- CreateEnum
CREATE TYPE "EmailImportState" AS ENUM ('PENDING', 'CONFIRMED', 'IGNORED');

-- CreateEnum
CREATE TYPE "DetectionConfidence" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyDomain" TEXT,
    "companyLogoUrl" TEXT,
    "jobTitle" TEXT NOT NULL,
    "jobUrl" TEXT,
    "location" TEXT,
    "workMode" "WorkMode",
    "employmentType" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryCurrency" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'SAVED',
    "source" "ApplicationSource" NOT NULL DEFAULT 'MANUAL',
    "sourceEmailId" TEXT,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "appliedAt" TIMESTAMP(3),
    "interviewAt" TIMESTAMP(3),
    "followUpAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_events" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromStatus" "ApplicationStatus",
    "toStatus" "ApplicationStatus" NOT NULL,
    "actor" TEXT NOT NULL DEFAULT 'user',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gmail_connections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleEmail" TEXT NOT NULL,
    "encryptedAccessToken" TEXT NOT NULL,
    "encryptedRefreshToken" TEXT NOT NULL,
    "tokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "lastHistoryId" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gmail_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_imports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "gmailMessageId" TEXT NOT NULL,
    "gmailThreadId" TEXT,
    "sender" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "detectedCompany" TEXT,
    "detectedJobTitle" TEXT,
    "suggestedStatus" "ApplicationStatus",
    "confidence" "DetectionConfidence",
    "matchedApplicationId" TEXT,
    "state" "EmailImportState" NOT NULL DEFAULT 'PENDING',
    "applicationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_imports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "applications_userId_idx" ON "applications"("userId");

-- CreateIndex
CREATE INDEX "applications_userId_status_idx" ON "applications"("userId", "status");

-- CreateIndex
CREATE INDEX "applications_userId_appliedAt_idx" ON "applications"("userId", "appliedAt");

-- CreateIndex
CREATE INDEX "applications_userId_sourceEmailId_idx" ON "applications"("userId", "sourceEmailId");

-- CreateIndex
CREATE UNIQUE INDEX "applications_userId_sourceEmailId_key" ON "applications"("userId", "sourceEmailId");

-- CreateIndex
CREATE INDEX "application_events_applicationId_createdAt_idx" ON "application_events"("applicationId", "createdAt");

-- CreateIndex
CREATE INDEX "application_events_userId_idx" ON "application_events"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "gmail_connections_userId_key" ON "gmail_connections"("userId");

-- CreateIndex
CREATE INDEX "email_imports_userId_state_idx" ON "email_imports"("userId", "state");

-- CreateIndex
CREATE INDEX "email_imports_userId_receivedAt_idx" ON "email_imports"("userId", "receivedAt");

-- CreateIndex
CREATE UNIQUE INDEX "email_imports_userId_gmailMessageId_key" ON "email_imports"("userId", "gmailMessageId");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_events" ADD CONSTRAINT "application_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gmail_connections" ADD CONSTRAINT "gmail_connections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_imports" ADD CONSTRAINT "email_imports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_imports" ADD CONSTRAINT "email_imports_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
