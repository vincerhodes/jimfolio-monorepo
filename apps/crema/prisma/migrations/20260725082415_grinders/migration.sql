-- CreateTable
CREATE TABLE "Grinder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manufacturer" TEXT,
    "model" TEXT,
    "type" TEXT,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BrewLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beanId" TEXT NOT NULL,
    "methodId" TEXT NOT NULL,
    "brewDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grindSize" TEXT,
    "grinder" TEXT,
    "grinderId" TEXT,
    "grindSetting" REAL,
    "rating" INTEGER,
    "notes" TEXT,
    "doseG" REAL,
    "yieldG" REAL,
    "brewTimeSec" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BrewLog_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BrewLog_methodId_fkey" FOREIGN KEY ("methodId") REFERENCES "BrewMethod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BrewLog_grinderId_fkey" FOREIGN KEY ("grinderId") REFERENCES "Grinder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_BrewLog" ("beanId", "brewDate", "brewTimeSec", "createdAt", "doseG", "grindSetting", "grindSize", "grinder", "id", "methodId", "notes", "rating", "yieldG") SELECT "beanId", "brewDate", "brewTimeSec", "createdAt", "doseG", "grindSetting", "grindSize", "grinder", "id", "methodId", "notes", "rating", "yieldG" FROM "BrewLog";
DROP TABLE "BrewLog";
ALTER TABLE "new_BrewLog" RENAME TO "BrewLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
