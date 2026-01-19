/**
 * Seed Complete IELTS Admission Test
 * Creates a full IELTS admission test with 80 questions (40 Listening + 40 Reading)
 * Run with: npx tsx scripts/seed-complete-admission-test.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function seedCompleteAdmissionTest() {
  console.log("🚀 Starting Complete IELTS Admission Test Seeding...\n");

  try {
    // Find or create admission test
    let admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      const [newTest] = await db
        .insert(tests)
        .values({
          title: "IELTS Admission Test",
          description: "Complete IELTS placement test with Listening and Reading sections to assess your English proficiency level",
          imageSrc: "/ielts-test.svg",
          testType: "ADMISSION_TEST",
          examType: "IELTS",
          duration: 180, // 3 hours
          isAdmission: true,
          createdBy: null,
        })
        .returning();
      admissionTest = newTest;
      console.log(`✅ Created admission test: ${admissionTest.title}\n`);
    } else {
      console.log(`✅ Found admission test: ${admissionTest.title}\n`);
      // Clear existing sections
      await db.delete(testSections).where(eq(testSections.testId, admissionTest.id));
      console.log("✅ Cleared existing sections\n");
    }

    // Create LISTENING sections (4 sections, 10 questions each = 40 total)
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

      // Create 10 questions per section
      for (let q = 1; q <= 10; q++) {
        const [question] = await db
          .insert(testQuestions)
          .values({
            sectionId: section.id,
            questionText: `Question ${s * 10 + q}: [Listening question placeholder]`,
            order: q,
            points: 1,
          })
          .returning();

        // Create 4 options
        for (let o = 0; o < 4; o++) {
          await db.insert(testQuestionOptions).values({
            questionId: question.id,
            optionText: `Option ${String.fromCharCode(65 + o)}: [Placeholder]`,
            isCorrect: o === 0,
            order: o + 1,
          });
        }
      }
      console.log(`  ✅ ${listeningTitles[s]} (10 questions)`);
    }

    // Create READING sections (3 sections, 13-14 questions each = 40 total)
    console.log("\n📚 Creating READING sections...");
    const readingTitles = [
      "Reading Passage 1 - General",
      "Reading Passage 2 - Academic",
      "Reading Passage 3 - Technical"
    ];
    const readingQuestionCounts = [13, 14, 13]; // Total: 40

    for (let s = 0; s < 3; s++) {
      const [section] = await db
        .insert(testSections)
        .values({
          testId: admissionTest.id,
          title: readingTitles[s],
          skillType: "READING",
          order: s + 5,
          duration: 20,
          passage: `[Reading passage ${s + 1} placeholder - approximately 300-400 words]`,
        })
        .returning();

      // Create questions for this section
      for (let q = 1; q <= readingQuestionCounts[s]; q++) {
        const [question] = await db
          .insert(testQuestions)
          .values({
            sectionId: section.id,
            questionText: `Question ${q}: [Reading question placeholder]`,
            order: q,
            points: 1,
          })
          .returning();

        // Create 4 options
        for (let o = 0; o < 4; o++) {
          await db.insert(testQuestionOptions).values({
            questionId: question.id,
            optionText: `Option ${String.fromCharCode(65 + o)}: [Placeholder]`,
            isCorrect: o === 0,
            order: o + 1,
          });
        }
      }
      console.log(`  ✅ ${readingTitles[s]} (${readingQuestionCounts[s]} questions)`);
    }

    console.log("\n✅ Complete IELTS Admission Test created successfully!");
    console.log("\n📊 Summary:");
    console.log("  - Listening: 4 sections × 10 questions = 40 questions");
    console.log("  - Reading: 3 sections × 13-14 questions = 40 questions");
    console.log("  - Total: 80 questions, 180 minutes");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

seedCompleteAdmissionTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

