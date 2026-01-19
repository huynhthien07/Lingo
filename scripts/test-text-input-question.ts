/**
 * Test script to create a TEXT_INPUT question
 * Run with: npx tsx scripts/test-text-input-question.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges, questions } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("🧪 Testing TEXT_INPUT Question Creation...\n");

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

    // Find Reading unit
    const readingUnit = await db.query.units.findFirst({
      where: and(
        eq(units.courseId, course.id),
        eq(units.order, 1)
      ),
    });

    if (!readingUnit) {
      console.error("❌ Reading unit not found!");
      return;
    }

    console.log(`✅ Unit: ${readingUnit.title} (ID: ${readingUnit.id})\n`);

    // Create a test lesson with TEXT_INPUT type
    console.log("📝 Creating test lesson...");
    const [testLesson] = await db
      .insert(lessons)
      .values({
        unitId: readingUnit.id,
        title: "TEST: Text Input Questions",
        description: "Test lesson for text input question type",
        order: 999, // Put at end
        skillType: "READING",
        estimatedDuration: 15,
      })
      .returning();

    console.log(`✅ Created lesson: ${testLesson.title} (ID: ${testLesson.id})\n`);

    // Create a challenge with TEXT_INPUT type
    console.log("🎯 Creating TEXT_INPUT challenge...");
    const [challenge] = await db
      .insert(challenges)
      .values({
        lessonId: testLesson.id,
        type: "READING_SENTENCE_COMPLETION", // This is a text input type
        question: "Complete the sentences with correct information from the passage",
        passage: "Read the following information:\n\nJohn Smith is a 25-year-old software engineer from London. He graduated from Oxford University in 2020 with a degree in Computer Science. He currently works at Google and enjoys playing tennis in his free time.",
        order: 1,
        difficulty: "EASY",
        points: 20,
      })
      .returning();

    console.log(`✅ Created challenge: ${challenge.question} (ID: ${challenge.id})\n`);

    // Create TEXT_INPUT questions with correct answers
    console.log("❓ Creating TEXT_INPUT questions...\n");

    const questionsData = [
      {
        text: "What is the person's full name?",
        correctAnswer: "John Smith",
      },
      {
        text: "How old is he?",
        correctAnswer: "25",
      },
      {
        text: "What is his occupation?",
        correctAnswer: "software engineer",
      },
      {
        text: "Which university did he attend?",
        correctAnswer: "Oxford University",
      },
      {
        text: "What sport does he enjoy?",
        correctAnswer: "tennis",
      },
    ];

    for (let i = 0; i < questionsData.length; i++) {
      const qData = questionsData[i];
      const [question] = await db
        .insert(questions)
        .values({
          challengeId: challenge.id,
          text: qData.text,
          correctAnswer: qData.correctAnswer,
          questionType: "TEXT_INPUT",
          order: i + 1,
        })
        .returning();

      console.log(`  ${i + 1}. ${question.text}`);
      console.log(`     ✓ Correct Answer: "${question.correctAnswer}"`);
    }

    console.log("\n✅ Test lesson created successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Lesson ID: ${testLesson.id}`);
    console.log(`  - Challenge ID: ${challenge.id}`);
    console.log(`  - Questions: ${questionsData.length} TEXT_INPUT questions`);
    console.log(`  - Each question has a correctAnswer field`);
    console.log("\n🎯 Next steps:");
    console.log(`  1. Go to /teacher/exercises/${challenge.id}`);
    console.log(`  2. You should see the questions with correct answers displayed`);
    console.log(`  3. Try adding a new TEXT_INPUT question - it should require correctAnswer`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

