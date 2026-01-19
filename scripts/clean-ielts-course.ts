/**
 * Clean all IELTS course data
 * Deletes all units, lessons, challenges, questions for IELTS Intermediate course
 * Run with: npx tsx scripts/clean-ielts-course.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges, questions, challengeOptions } from "../db/schema";
import { eq, and, inArray } from "drizzle-orm";

async function main() {
  console.log("🗑️  Starting IELTS course cleanup...\n");

  try {
    // Find the course
    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.title, "IELTS Intermediate - Band 5.0-6.0"),
        eq(courses.examType, "IELTS")
      ),
    });

    if (!course) {
      console.error("❌ Course not found!");
      return;
    }

    console.log(`✅ Found course: ${course.title} (ID: ${course.id})\n`);

    // Find all units for this course
    const allUnits = await db.query.units.findMany({
      where: eq(units.courseId, course.id),
    });

    if (allUnits.length === 0) {
      console.log("ℹ️  No units found. Course is already clean.");
      return;
    }

    console.log(`📊 Found ${allUnits.length} units to delete\n`);

    const unitIds = allUnits.map(u => u.id);

    // Find all lessons
    const allLessons = await db.query.lessons.findMany({
      where: inArray(lessons.unitId, unitIds),
    });

    console.log(`📚 Found ${allLessons.length} lessons`);

    let totalChallenges = 0;
    let totalQuestions = 0;

    if (allLessons.length > 0) {
      const lessonIds = allLessons.map(l => l.id);

      // Find all challenges
      const allChallenges = await db.query.challenges.findMany({
        where: inArray(challenges.lessonId, lessonIds),
      });

      totalChallenges = allChallenges.length;
      console.log(`🎯 Found ${totalChallenges} challenges`);

      if (allChallenges.length > 0) {
        const challengeIds = allChallenges.map(c => c.id);

        // Find all questions
        const allQuestions = await db.query.questions.findMany({
          where: inArray(questions.challengeId, challengeIds),
        });

        totalQuestions = allQuestions.length;
        console.log(`❓ Found ${totalQuestions} questions`);

        if (allQuestions.length > 0) {
          const questionIds = allQuestions.map(q => q.id);

          // Delete challenge options
          console.log("\n🗑️  Deleting challenge options...");
          await db.delete(challengeOptions).where(inArray(challengeOptions.questionId, questionIds));
          console.log("  ✅ Deleted challenge options");
        }

        // Delete questions
        console.log("🗑️  Deleting questions...");
        await db.delete(questions).where(inArray(questions.challengeId, challengeIds));
        console.log(`  ✅ Deleted ${totalQuestions} questions`);
      }

      // Delete challenges
      console.log("🗑️  Deleting challenges...");
      await db.delete(challenges).where(inArray(challenges.lessonId, lessonIds));
      console.log(`  ✅ Deleted ${totalChallenges} challenges`);
    }

    // Delete lessons
    console.log("🗑️  Deleting lessons...");
    await db.delete(lessons).where(inArray(lessons.unitId, unitIds));
    console.log(`  ✅ Deleted ${allLessons.length} lessons`);

    // Delete units
    console.log("🗑️  Deleting units...");
    await db.delete(units).where(inArray(units.id, unitIds));
    console.log(`  ✅ Deleted ${allUnits.length} units`);

    console.log("\n✅ Cleanup completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Deleted ${allUnits.length} units`);
    console.log(`  - Deleted ${allLessons.length} lessons`);
    console.log(`  - Deleted ${totalChallenges} challenges`);
    console.log(`  - Deleted ${totalQuestions} questions`);
    console.log("\n✨ Course is now clean and ready for fresh data!");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Cleanup failed:", error);
    process.exit(1);
  });

