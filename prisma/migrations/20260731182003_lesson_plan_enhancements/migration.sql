-- AlterTable
ALTER TABLE "class_sessions" ADD COLUMN     "duration" INTEGER;

-- AlterTable
ALTER TABLE "lesson_plans" ADD COLUMN     "achievedObjectives" TEXT,
ADD COLUMN     "competences" TEXT,
ADD COLUMN     "evaluationCriteria" TEXT,
ADD COLUMN     "methodology" TEXT,
ADD COLUMN     "observations" TEXT;
