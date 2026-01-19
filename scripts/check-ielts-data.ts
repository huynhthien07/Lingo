/**
 * Check IELTS course data
 * Shows summary of all units, lessons, challenges, and questions
 * Run with: npx tsx scripts/check-ielts-data.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges, questions } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("📊 Checking IELTS Course Data...\n");

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

    console.log(`✅ Course: ${course.title} (ID: ${course.id})\n`);

    // Get all units
    const allUnits = await db.query.units.findMany({
      where: eq(units.courseId, course.id),
      orderBy: (units, { asc }) => [asc(units.order)],
    });

    if (allUnits.length === 0) {
      console.log("ℹ️  No units found.");
      return;
    }

    console.log(`📚 Found ${allUnits.length} units:\n`);

    let totalLessons = 0;
    let totalChallenges = 0;
    let totalQuestions = 0;

    for (const unit of allUnits) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`📖 Unit ${unit.order}: ${unit.title}`);
      console.log(`${"=".repeat(60)}`);

      // Get lessons for this unit
      const unitLessons = await db.query.lessons.findMany({
        where: eq(lessons.unitId, unit.id),
        orderBy: (lessons, { asc }) => [asc(lessons.order)],
      });

      totalLessons += unitLessons.length;
      console.log(`\n  📝 ${unitLessons.length} lessons:\n`);

      for (const lesson of unitLessons) {
        // Get challenges for this lesson
        const lessonChallenges = await db.query.challenges.findMany({
          where: eq(challenges.lessonId, lesson.id),
          orderBy: (challenges, { asc }) => [asc(challenges.order)],
        });

        totalChallenges += lessonChallenges.length;

        // Count questions for all challenges in this lesson
        let lessonQuestionCount = 0;
        for (const challenge of lessonChallenges) {
          const challengeQuestions = await db.query.questions.findMany({
            where: eq(questions.challengeId, challenge.id),
          });
          lessonQuestionCount += challengeQuestions.length;
        }

        totalQuestions += lessonQuestionCount;

        console.log(`  ${lesson.order}. ${lesson.title}`);
        console.log(`     Type: ${lesson.skillType || 'N/A'}`);
        console.log(`     Challenges: ${lessonChallenges.length}`);
        console.log(`     Questions: ${lessonQuestionCount}`);
        console.log(`     Duration: ${lesson.estimatedDuration || 'N/A'} min`);
        console.log();
      }
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`📊 SUMMARY`);
    console.log(`${"=".repeat(60)}`);
    console.log(`  Units:      ${allUnits.length}`);
    console.log(`  Lessons:    ${totalLessons}`);
    console.log(`  Challenges: ${totalChallenges}`);
    console.log(`  Questions:  ${totalQuestions}`);
    console.log(`${"=".repeat(60)}\n`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Check failed:", error);
    process.exit(1);
  });

