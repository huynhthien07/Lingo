/**
 * Extend Admission Test - Add More Reading Questions (Part 3-5)
 * Adds 30 more reading questions to reach 40 total
 * Run with: npx tsx scripts/extend-admission-test-reading.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function extendAdmissionTestReading() {
  console.log("🚀 Extending Admission Test - Adding Reading Questions...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found!");
      process.exit(1);
    }

    let questionNumber = 21; // Continue from Q21

    // ========================================================================
    // READING SECTION 3: Paragraph Matching (10 questions)
    // ========================================================================
    console.log("📝 Creating READING Section 3: Paragraph Matching...");
    const readingPassage3 = `
      Paragraph A: Climate change is one of the most pressing issues of our time...
      Paragraph B: Renewable energy sources have become increasingly important...
      Paragraph C: The role of governments in environmental protection...
      Paragraph D: Individual actions can make a significant difference...
      Paragraph E: International cooperation is essential for tackling climate change...
    `;

    const [readingMatching] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Reading Part 3 - Paragraph Matching",
        skillType: "READING",
        order: 7,
        duration: 10,
        passage: readingPassage3,
      })
      .returning();

    const matchingQuestions = [
      "Which paragraph discusses the importance of renewable energy?",
      "Which paragraph mentions international cooperation?",
      "Which paragraph focuses on individual actions?",
      "Which paragraph talks about government responsibility?",
      "Which paragraph introduces climate change as a major issue?",
      "Which paragraph emphasizes collective action?",
      "Which paragraph discusses energy alternatives?",
      "Which paragraph highlights personal responsibility?",
      "Which paragraph mentions global cooperation?",
      "Which paragraph addresses environmental protection?"
    ];

    for (let q = 0; q < matchingQuestions.length; q++) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: readingMatching.id,
          questionText: matchingQuestions[q],
          order: q + 1,
          points: 1,
        })
        .returning();

      const paragraphs = ["A", "B", "C", "D", "E"];
      for (let o = 0; o < paragraphs.length; o++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: `Paragraph ${paragraphs[o]}`,
          isCorrect: o === q % 5,
          order: o + 1,
        });
      }
      questionNumber++;
    }
    console.log(`  ✅ Created 10 paragraph matching questions\n`);

    // ========================================================================
    // READING SECTION 4: Summary Completion (10 questions)
    // ========================================================================
    console.log("📝 Creating READING Section 4: Summary Completion...");
    const readingPassage4 = `
      The history of aviation is a fascinating journey of human innovation...
      From the Wright brothers' first flight to modern commercial aircraft...
      Technology has continuously evolved to make air travel safer and more efficient...
    `;

    const [readingSummary] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Reading Part 4 - Summary Completion",
        skillType: "READING",
        order: 8,
        duration: 10,
        passage: readingPassage4,
      })
      .returning();

    const summaryQuestions = [
      "The Wright brothers made the first _____ flight.",
      "Aviation technology has _____ over time.",
      "Modern aircraft are designed to be _____ and efficient.",
      "Commercial aviation has _____ significantly.",
      "Safety improvements have _____ air travel.",
      "The history of flight shows human _____.",
      "Aircraft design has _____ with technology.",
      "Modern planes are _____ than earlier models.",
      "Aviation continues to _____.",
      "Technology has _____ the aviation industry."
    ];

    for (let q = 0; q < summaryQuestions.length; q++) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: readingSummary.id,
          questionText: summaryQuestions[q],
          order: q + 1,
          points: 1,
        })
        .returning();

      const options = ["evolved", "improved", "changed", "developed"];
      for (let o = 0; o < options.length; o++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: options[o],
          isCorrect: o === 0,
          order: o + 1,
        });
      }
      questionNumber++;
    }
    console.log(`  ✅ Created 10 summary completion questions\n`);

    // ========================================================================
    // READING SECTION 5: Sentence Completion (10 questions)
    // ========================================================================
    console.log("📝 Creating READING Section 5: Sentence Completion...");
    const readingPassage5 = `
      Artificial intelligence is transforming various industries...
      Machine learning algorithms can process vast amounts of data...
      The future of AI depends on ethical considerations...
    `;

    const [readingSentence] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Reading Part 5 - Sentence Completion",
        skillType: "READING",
        order: 9,
        duration: 10,
        passage: readingPassage5,
      })
      .returning();

    for (let q = 1; q <= 10; q++) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: readingSentence.id,
          questionText: `Question ${questionNumber}: According to the passage, _____.`,
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
    console.log(`  ✅ Created 10 sentence completion questions\n`);

    console.log("✅ Reading sections extended successfully!");
    console.log("📊 Total Reading Questions: 40 (5 sections × 8-10 questions)");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

extendAdmissionTestReading()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

