-- CreateTable
CREATE TABLE "staff_members" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'TEAM_MEMBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "verification_checks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerName" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requestedBy" TEXT NOT NULL,
    "requestedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedBy" TEXT,
    "verifiedAt" DATETIME,
    "result" TEXT,
    "notes" TEXT,
    CONSTRAINT "verification_checks_verifiedBy_fkey" FOREIGN KEY ("verifiedBy") REFERENCES "staff_members" ("email") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "daily_productivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffMemberId" TEXT NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productiveHours" REAL NOT NULL DEFAULT 7.0,
    "totalHours" REAL NOT NULL DEFAULT 7.0,
    "benchmarkAdjustment" REAL NOT NULL DEFAULT 1.0,
    CONSTRAINT "daily_productivity_staffMemberId_fkey" FOREIGN KEY ("staffMemberId") REFERENCES "staff_members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "capacity_forecasts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "expectedStaff" INTEGER NOT NULL,
    "expectedCapacity" REAL NOT NULL,
    "actualCapacity" REAL,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_email_key" ON "staff_members"("email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_productivity_staffMemberId_date_key" ON "daily_productivity"("staffMemberId", "date");
