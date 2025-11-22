-- CreateTable
CREATE TABLE "AppFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
