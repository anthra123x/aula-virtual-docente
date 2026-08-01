-- AlterEnum
ALTER TYPE "ClassStatus" ADD VALUE 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "endedAt" TIMESTAMP(3),
ADD COLUMN     "momentsCompleted" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "startedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "class_notes" (
    "id" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'DESARROLLO',
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_notes_classSessionId_idx" ON "class_notes"("classSessionId");

-- AddForeignKey
ALTER TABLE "class_notes" ADD CONSTRAINT "class_notes_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "class_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
