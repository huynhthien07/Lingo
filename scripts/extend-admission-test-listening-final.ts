/**
 * Extend Admission Test - Add Final 5 Listening Questions
 * Adds 5 more listening questions to reach 40 total
 * Run with: npx tsx scripts/extend-admission-test-listening-final.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function extendAdmissionTestListeningFinal() {
  console.log("🚀 Extending Admission Test - Adding Final 5 Listening Questions...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found!");
      process.exit(1);
    }

    // ========================================================================
    // LISTENING SECTION 7: Completion (5 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 7: Completion...");
    const [listeningCompletion] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 7 - Completion",
        skillType: "LISTENING",
        order: 7,
        duration: 5,
      })
      .returning();

    const completionData = [
      "The meeting will be held on _____.",
      "The project deadline is _____.",
      "The budget for the project is _____.",
      "The team leader's name is _____.",
      "The location of the event is _____."
    ];

    for (let q = 0; q < completionData.length; q++) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: listeningCompletion.id,
          questionText: completionData[q],
          order: q + 1,
          points: 1,
        })
        .returning();

      const options = ["Option A", "Option B", "Option C", "Option D"];
      for (let o = 0; o < 4; o++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: options[o],
          isCorrect: o === 0,
          order: o + 1,
        });
      }
    }
    console.log(`  ✅ Created 5 completion questions\n`);

    console.log("✅ Final listening questions added successfully!");
    console.log("📊 Total Listening Questions: 40 (7 sections)");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

extendAdmissionTestListeningFinal()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

