/**
 * Recreate Admission Test - Part 4: Use of English
 * Run with: npx tsx scripts/recreate-admission-test-part4.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function recreateAdmissionTestPart4() {
  console.log("🚀 Starting Admission Test Part 4: Use of English...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found. Run part 1 first!");
      process.exit(1);
    }

    let questionNumber = 20; // Continue from Q20

    // ========================================================================
    // USE OF ENGLISH SECTION 7: Grammar MCQ (8 questions)
    // ========================================================================
    console.log("📝 Creating USE OF ENGLISH Section 7: Grammar...");
    const [grammarSection] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Use of English Part 1 - Grammar",
        skillType: "GRAMMAR",
        order: 7,
        duration: 5,
      })
      .returning();

    const grammarData = [
      {
        text: "She ___ to the store yesterday.",
        options: [
          { text: "goes", correct: false },
          { text: "went", correct: true },
          { text: "has gone", correct: false },
          { text: "is going", correct: false },
        ],
      },
      {
        text: "By next year, I ___ here for 5 years.",
        options: [
          { text: "will work", correct: false },
          { text: "have worked", correct: false },
          { text: "will have worked", correct: true },
          { text: "am working", correct: false },
        ],
      },
      {
        text: "If I ___ you, I would accept the offer.",
        options: [
          { text: "am", correct: false },
          { text: "was", correct: false },
          { text: "were", correct: true },
          { text: "had been", correct: false },
        ],
      },
      {
        text: "The book ___ by millions of people.",
        options: [
          { text: "is read", correct: true },
          { text: "reads", correct: false },
          { text: "has read", correct: false },
          { text: "read", correct: false },
        ],
      },
      {
        text: "She made me ___ the dishes.",
        options: [
          { text: "wash", correct: true },
          { text: "to wash", correct: false },
          { text: "washing", correct: false },
          { text: "washed", correct: false },
        ],
      },
      {
        text: "I wish I ___ more time to study.",
        options: [
          { text: "have", correct: false },
          { text: "had", correct: true },
          { text: "would have", correct: false },
          { text: "have had", correct: false },
        ],
      },
      {
        text: "He is interested ___ learning English.",
        options: [
          { text: "in", correct: true },
          { text: "on", correct: false },
          { text: "at", correct: false },
          { text: "for", correct: false },
        ],
      },
      {
        text: "Neither John nor his friends ___ coming.",
        options: [
          { text: "is", correct: true },
          { text: "are", correct: false },
          { text: "am", correct: false },
          { text: "be", correct: false },
        ],
      },
    ];

    for (const q of grammarData) {
      questionNumber++;
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: grammarSection.id,
          questionText: `<p><strong>Question ${questionNumber}:</strong> ${q.text}</p>`,
          questionType: "SINGLE_CHOICE",
          order: questionNumber,
          points: 1,
        })
        .returning();

      for (let i = 0; i < q.options.length; i++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: q.options[i].text,
          isCorrect: q.options[i].correct,
          order: i + 1,
        });
      }
    }
    console.log(`  ✅ Created 8 Grammar questions (Q21-Q28)\n`);

    // ========================================================================
    // USE OF ENGLISH SECTION 8: Vocabulary MCQ (5 questions)
    // ========================================================================
    console.log("📝 Creating USE OF ENGLISH Section 8: Vocabulary...");
    const [vocabularySection] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Use of English Part 2 - Vocabulary",
        skillType: "GRAMMAR",
        order: 8,
        duration: 5,
      })
      .returning();

    const vocabularyData = [
      {
        text: "Choose the synonym for 'abundant':",
        options: [
          { text: "plentiful", correct: true },
          { text: "scarce", correct: false },
          { text: "limited", correct: false },
          { text: "rare", correct: false },
        ],
      },
      {
        text: "The evidence was ___.",
        options: [
          { text: "conclusive", correct: true },
          { text: "vague", correct: false },
          { text: "unclear", correct: false },
          { text: "ambiguous", correct: false },
        ],
      },
      {
        text: "Which word means 'to make worse'?",
        options: [
          { text: "exacerbate", correct: true },
          { text: "alleviate", correct: false },
          { text: "improve", correct: false },
          { text: "enhance", correct: false },
        ],
      },
      {
        text: "Choose the correct collocation: ___ attention",
        options: [
          { text: "pay", correct: true },
          { text: "give", correct: false },
          { text: "make", correct: false },
          { text: "take", correct: false },
        ],
      },
      {
        text: "Select the antonym of 'optimistic':",
        options: [
          { text: "pessimistic", correct: true },
          { text: "realistic", correct: false },
          { text: "practical", correct: false },
          { text: "logical", correct: false },
        ],
      },
    ];

    for (const q of vocabularyData) {
      questionNumber++;
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: vocabularySection.id,
          questionText: `<p><strong>Question ${questionNumber}:</strong> ${q.text}</p>`,
          questionType: "SINGLE_CHOICE",
          order: questionNumber,
          points: 1,
        })
        .returning();

      for (let i = 0; i < q.options.length; i++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: q.options[i].text,
          isCorrect: q.options[i].correct,
          order: i + 1,
        });
      }
    }
    console.log(`  ✅ Created 5 Vocabulary questions (Q29-Q33)\n`);

    // ========================================================================
    // USE OF ENGLISH SECTION 9: Error Recognition (2 questions)
    // ========================================================================
    console.log("📝 Creating USE OF ENGLISH Section 9: Error Recognition...");
    const [errorSection] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Use of English Part 3 - Error Recognition",
        skillType: "GRAMMAR",
        order: 9,
        duration: 5,
      })
      .returning();

    const errorData = [
      {
        text: "Identify the error: 'She don't like coffee.'",
        options: [
          { text: "don't should be doesn't", correct: true },
          { text: "like should be likes", correct: false },
          { text: "coffee should be coffees", correct: false },
          { text: "No error", correct: false },
        ],
      },
      {
        text: "Find the mistake: 'I have went to Paris last year.'",
        options: [
          { text: "went should be gone", correct: true },
          { text: "have should be had", correct: false },
          { text: "Paris should be paris", correct: false },
          { text: "No error", correct: false },
        ],
      },
    ];

    for (const q of errorData) {
      questionNumber++;
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: errorSection.id,
          questionText: `<p><strong>Question ${questionNumber}:</strong> ${q.text}</p>`,
          questionType: "SINGLE_CHOICE",
          order: questionNumber,
          points: 1,
        })
        .returning();

      for (let i = 0; i < q.options.length; i++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: q.options[i].text,
          isCorrect: q.options[i].correct,
          order: i + 1,
        });
      }
    }
    console.log(`  ✅ Created 2 Error Recognition questions (Q34-Q35)\n`);

    console.log("=" .repeat(70));
    console.log("✅ ADMISSION TEST RECREATION COMPLETED SUCCESSFULLY!");
    console.log("=" .repeat(70));
    console.log(`\nTest ID: ${admissionTest.id}`);
    console.log(`Test Title: ${admissionTest.title}`);
    console.log(`Total Duration: 45 minutes`);
    console.log(`Total Questions: 35`);
    console.log("\nSections:");
    console.log("  1. Listening Part 1 - Multiple Choice (4 questions)");
    console.log("  2. Listening Part 2 - Short Answer (3 questions)");
    console.log("  3. Listening Part 3 - Ordering (3 questions)");
    console.log("  4. Reading Part 1 - True/False/Not Given (4 questions)");
    console.log("  5. Reading Part 2 - Multiple Choice (3 questions)");
    console.log("  6. Reading Part 3 - Matching Headings (3 questions)");
    console.log("  7. Use of English Part 1 - Grammar (8 questions)");
    console.log("  8. Use of English Part 2 - Vocabulary (5 questions)");
    console.log("  9. Use of English Part 3 - Error Recognition (2 questions)");
    console.log("=" .repeat(70));

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

recreateAdmissionTestPart4();

