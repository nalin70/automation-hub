-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "source" TEXT,
    "description" TEXT,
    "postedAtText" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SentJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "sentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SentJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SentJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SentJob_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "JobPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "experienceId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "keywordsJson" TEXT NOT NULL DEFAULT '[]',
    "summary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JobPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_link_key" ON "Job"("link");

-- CreateIndex
CREATE INDEX "Job_externalId_idx" ON "Job"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "SentJob_userId_jobId_key" ON "SentJob"("userId", "jobId");

-- CreateIndex
CREATE INDEX "SentJob_userId_sentAt_idx" ON "SentJob"("userId", "sentAt");

-- CreateIndex
CREATE INDEX "SentJob_scheduleId_idx" ON "SentJob"("scheduleId");

-- CreateIndex
CREATE UNIQUE INDEX "JobPreference_userId_key" ON "JobPreference"("userId");
