/**
 * Script to check lesson progress for debugging
 * Run with: npx tsx scripts/check-progress.ts <userId> <lessonId>
 */

import db from "@/db/drizzle";
import { challengeProgress, lessonProgress, challenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function checkProgress(userId: string, lessonId: number) {
  console.log("\n🔍 Checking Progress for:");
  console.log("User ID:", userId);
  console.log("Lesson ID:", lessonId);
  console.log("─".repeat(60));

  // Get all challenges in this lesson
  const allChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonId),
  });

  console.log("\n📚 Challenges in Lesson:");
  console.log("Total challenges:", allChallenges.length);
  allChallenges.forEach((c, i) => {
    console.log(`  ${i + 1}. [ID: ${c.id}] ${c.question} (${c.type})`);
  });

  // Get challenge progress for this user
  const userProgress = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, userId),
  });

  console.log("\n✅ User's Challenge Progress:");
  const completedInLesson = allChallenges.filter((c) =>
    userProgress.some((cp) => cp.challengeId === c.id && cp.completed)
  );

  completedInLesson.forEach((c, i) => {
    const progress = userProgress.find((cp) => cp.challengeId === c.id);
    console.log(`  ${i + 1}. [ID: ${c.id}] ${c.question} - Score: ${progress?.score || 0}`);
  });

  console.log("\n📊 Summary:");
  console.log(`Completed: ${completedInLesson.length}/${allChallenges.length}`);
  console.log(`Lesson Complete: ${completedInLesson.length === allChallenges.length ? "✅ YES" : "❌ NO"}`);

  // Check lesson progress
  const lessonProg = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, lessonId)
    ),
  });

  console.log("\n🎯 Lesson Progress Record:");
  if (lessonProg) {
    console.log("  Status:", lessonProg.completed ? "✅ Completed" : "⏳ In Progress");
    console.log("  Completed At:", lessonProg.completedAt || "N/A");
  } else {
    console.log("  ❌ No lesson progress record found");
  }

  console.log("\n" + "─".repeat(60));
}

// Get command line arguments
const userId = process.argv[2];
const lessonId = parseInt(process.argv[3]);

if (!userId || !lessonId) {
  console.error("Usage: npx tsx scripts/check-progress.ts <userId> <lessonId>");
  process.exit(1);
}

checkProgress(userId, lessonId)
  .then(() => {
    console.log("\n✅ Check complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });

