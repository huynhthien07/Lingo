/**
 * Clean and Seed Complete IELTS Admission Test
 * Deletes old admission test and creates a new one with 80 questions
 * Run with: npx tsx scripts/clean-and-seed-admission-test.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions, testAttempts } from "../db/schema";
import { eq } from "drizzle-orm";

async function cleanAndSeedAdmissionTest() {
  console.log("🚀 Starting Clean and Seed Admission Test...\n");

  try {
    // Find and delete old admission test
    const oldTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (oldTest) {
      console.log("🗑️ Deleting old admission test...");
      // Delete attempts first
      await db.delete(testAttempts).where(eq(testAttempts.testId, oldTest.id));
      // Delete sections (cascade will delete questions and options)
      await db.delete(testSections).where(eq(testSections.testId, oldTest.id));
      // Delete test
      await db.delete(tests).where(eq(tests.id, oldTest.id));
      console.log("✅ Old admission test deleted\n");
    }

    // Create new admission test
    const [admissionTest] = await db
      .insert(tests)
      .values({
        title: "IELTS Admission Test",
        description: "Complete IELTS placement test with Listening and Reading sections",
        imageSrc: "/ielts-test.svg",
        testType: "ADMISSION_TEST",
        examType: "IELTS",
        duration: 180,
        isAdmission: true,
        createdBy: null,
      })
      .returning();

    console.log(`✅ Created admission test: ${admissionTest.title}\n`);

    // Create LISTENING sections (4 sections, 10 questions each)
    console.log("📻 Creating LISTENING sections...");
    const listeningTitles = [
      "Listening Part 1 - Conversation",
      "Listening Part 2 - Monologue",
      "Listening Part 3 - Academic Discussion",
      "Listening Part 4 - Lecture"
    ];

    for (let s = 0; s < 4; s++) {
      const [section] = await db
        .insert(testSections)
        .values({
          testId: admissionTest.id,
          title: listeningTitles[s],
          skillType: "LISTENING",
          order: s + 1,
          duration: 15,
        })
        .returning();

      for (let q = 1; q <= 10; q++) {
        const [question] = await db
          .insert(testQuestions)
          .values({
            sectionId: section.id,
            questionText: `Question ${s * 10 + q}: [Listening question]`,
            order: q,
            points: 1,
          })
          .returning();

        for (let o = 0; o < 4; o++) {
          await db.insert(testQuestionOptions).values({
            questionId: question.id,
            optionText: `Option ${String.fromCharCode(65 + o)}`,
            isCorrect: o === 0,
            order: o + 1,
          });
        }
      }
      console.log(`  ✅ ${listeningTitles[s]}`);
    }

    // Create READING sections (3 sections)
    console.log("\n📚 Creating READING sections...");
    const readingTitles = [
      "Reading Passage 1 - General",
      "Reading Passage 2 - Academic",
      "Reading Passage 3 - Technical"
    ];
    const readingQuestionCounts = [13, 14, 13];

    for (let s = 0; s < 3; s++) {
      const [section] = await db
        .insert(testSections)
        .values({
          testId: admissionTest.id,
          title: readingTitles[s],
          skillType: "READING",
          order: s + 5,
          duration: 20,
          passage: `[Reading passage ${s + 1}]`,
        })
        .returning();

      for (let q = 1; q <= readingQuestionCounts[s]; q++) {
        const [question] = await db
          .insert(testQuestions)
          .values({
            sectionId: section.id,
            questionText: `Question ${q}: [Reading question]`,
            order: q,
            points: 1,
          })
          .returning();

        for (let o = 0; o < 4; o++) {
          await db.insert(testQuestionOptions).values({
            questionId: question.id,
            optionText: `Option ${String.fromCharCode(65 + o)}`,
            isCorrect: o === 0,
            order: o + 1,
          });
        }
      }
      console.log(`  ✅ ${readingTitles[s]}`);
    }

    console.log("\n✅ Complete IELTS Admission Test created!");
    console.log("\n📊 Summary:");
    console.log("  - Listening: 4 sections × 10 = 40 questions");
    console.log("  - Reading: 3 sections × 13-14 = 40 questions");
    console.log("  - Total: 80 questions, 180 minutes");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

cleanAndSeedAdmissionTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

