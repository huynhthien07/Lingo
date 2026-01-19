/**
 * Extend Admission Test - Add More Listening Questions (Part 4-7)
 * Adds 30 more listening questions to reach 40 total
 * Run with: npx tsx scripts/extend-admission-test-listening.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function extendAdmissionTestListening() {
  console.log("🚀 Extending Admission Test - Adding Listening Questions...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found!");
      process.exit(1);
    }

    let questionNumber = 11; // Continue from Q11

    // ========================================================================
    // LISTENING SECTION 4: Short Answer (10 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 4: Short Answer...");
    const [listeningShortAnswer] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 4 - Short Answer",
        skillType: "LISTENING",
        order: 4,
        duration: 10,
      })
      .returning();

    const shortAnswerData = [
      "What is the speaker's main profession?",
      "How many years of experience does the speaker have?",
      "What is the name of the company mentioned?",
      "When did the project start?",
      "What is the budget for the project?",
      "Who is responsible for the marketing?",
      "What is the deadline for completion?",
      "How many team members are involved?",
      "What is the main objective of the project?",
      "Where will the project be implemented?"
    ];

    for (const q of shortAnswerData) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: listeningShortAnswer.id,
          questionText: q,
          order: questionNumber - 10,
          points: 1,
        })
        .returning();

      // Short answer questions typically have text input, but we'll add options for compatibility
      for (let o = 0; o < 4; o++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: `Answer option ${o + 1}`,
          isCorrect: o === 0,
          order: o + 1,
        });
      }
      questionNumber++;
    }
    console.log(`  ✅ Created 10 short answer questions\n`);

    // ========================================================================
    // LISTENING SECTION 5: Conversation (10 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 5: Conversation...");
    const [listeningConversation] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 5 - Conversation",
        skillType: "LISTENING",
        order: 5,
        duration: 10,
      })
      .returning();

    for (let q = 1; q <= 10; q++) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: listeningConversation.id,
          questionText: `Question ${questionNumber}: What does the speaker suggest?`,
          order: q,
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
      questionNumber++;
    }
    console.log(`  ✅ Created 10 conversation questions\n`);

    // ========================================================================
    // LISTENING SECTION 6: Lecture (10 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 6: Lecture...");
    const [listeningLecture] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 6 - Lecture",
        skillType: "LISTENING",
        order: 6,
        duration: 10,
      })
      .returning();

    for (let q = 1; q <= 10; q++) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: listeningLecture.id,
          questionText: `Question ${questionNumber}: According to the lecture...`,
          order: q,
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
      questionNumber++;
    }
    console.log(`  ✅ Created 10 lecture questions\n`);

    console.log("✅ Listening sections extended successfully!");
    console.log("📊 Total Listening Questions: 40 (4 sections × 10 questions)");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

extendAdmissionTestListening()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

