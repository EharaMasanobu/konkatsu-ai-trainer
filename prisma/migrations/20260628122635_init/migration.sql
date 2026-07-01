-- CreateTable
CREATE TABLE "ConversationSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "currentTurn" INTEGER NOT NULL,
    "minTurn" INTEGER NOT NULL,
    "maxTurn" INTEGER NOT NULL,
    "userProfile" JSONB NOT NULL,
    "femaleProfile" JSONB NOT NULL,
    "personality" JSONB NOT NULL,
    "hiddenGoal" JSONB NOT NULL,
    "conversationHistory" JSONB NOT NULL,
    "memory" JSONB NOT NULL,
    "emotion" JSONB NOT NULL,
    "impression" JSONB NOT NULL
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    CONSTRAINT "Evaluation_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ConversationSession" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ConversationSession_status_idx" ON "ConversationSession"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_sessionId_key" ON "Evaluation"("sessionId");
