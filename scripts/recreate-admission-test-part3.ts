/**
 * Recreate Admission Test - Part 3: Reading MCQ + Matching + Use of English
 * Run with: npx tsx scripts/recreate-admission-test-part3.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function recreateAdmissionTestPart3() {
  console.log("🚀 Starting Admission Test Part 3...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found. Run part 1 first!");
      process.exit(1);
    }

    let questionNumber = 14; // Continue from Q14

    const readingPassage = `
      <h3>The Impact of Technology on Modern Education</h3>
      <p><strong>Paragraph A:</strong> In recent years, technology has revolutionized the way we approach education...</p>
      <p><strong>Paragraph B:</strong> However, the integration of technology in education is not without its challenges...</p>
      <p><strong>Paragraph C:</strong> Despite these concerns, research conducted in 2022...</p>
      <p><strong>Paragraph D:</strong> Looking ahead, experts predict that artificial intelligence...</p>
    `;

    // ========================================================================
    // READING SECTION 5: Multiple Choice (3 questions)
    // ========================================================================
    console.log("📝 Creating READING Section 5: Multiple Choice...");
    const [readingMCQ] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Reading Part 2 - Multiple Choice",
        skillType: "READING",
        order: 5,
        duration: 5,
        passage: readingPassage,
      })
      .returning();

    const readingMCQData = [
      {
        text: "What is the main idea of the passage?",
        options: [
          { text: "Technology has both benefits and challenges in education", correct: true },
          { text: "Traditional education is better than digital learning", correct: false },
          { text: "All students should use technology in classrooms", correct: false },
          { text: "Technology will replace teachers in the future", correct: false },
        ],
      },
      {
        text: "According to the text, what is one challenge of technology in education?",
        options: [
          { text: "It can create inequality between different socioeconomic groups", correct: true },
          { text: "It is too expensive for all schools", correct: false },
          { text: "Teachers don't know how to use it", correct: false },
          { text: "Students don't like using technology", correct: false },
        ],
      },
      {
        text: "What do experts predict about the future of education?",
        options: [
          { text: "AI and VR will create personalized learning experiences", correct: true },
          { text: "Technology will be banned from classrooms", correct: false },
          { text: "All education will be online", correct: false },
          { text: "Traditional methods will completely disappear", correct: false },
        ],
      },
    ];

    for (const q of readingMCQData) {
      questionNumber++;
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: readingMCQ.id,
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
    console.log(`  ✅ Created 3 MCQ questions (Q15-Q17)\n`);

    // ========================================================================
    // READING SECTION 6: Matching Headings (3 questions)
    // ========================================================================
    console.log("📝 Creating READING Section 6: Matching Headings...");
    const [readingMatching] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Reading Part 3 - Matching Headings",
        skillType: "READING",
        order: 6,
        duration: 5,
        passage: readingPassage,
      })
      .returning();

    const matchingData = [
      {
        text: "Match Paragraph A with the correct heading:",
        leftItems: [{ id: 1, text: "Paragraph A", order: 1 }],
        rightItems: [
          { id: 1, text: "The Revolution of Digital Learning", order: 1 },
          { id: 2, text: "Challenges in Modern Education", order: 2 },
          { id: 3, text: "Future Technologies in Schools", order: 3 },
        ],
        correctPairs: [{ leftId: 1, rightId: 1 }],
      },
      {
        text: "Match Paragraph B with the correct heading:",
        leftItems: [{ id: 1, text: "Paragraph B", order: 1 }],
        rightItems: [
          { id: 1, text: "The Revolution of Digital Learning", order: 1 },
          { id: 2, text: "Challenges in Modern Education", order: 2 },
          { id: 3, text: "Future Technologies in Schools", order: 3 },
        ],
        correctPairs: [{ leftId: 1, rightId: 2 }],
      },
      {
        text: "Match Paragraph D with the correct heading:",
        leftItems: [{ id: 1, text: "Paragraph D", order: 1 }],
        rightItems: [
          { id: 1, text: "The Revolution of Digital Learning", order: 1 },
          { id: 2, text: "Challenges in Modern Education", order: 2 },
          { id: 3, text: "Future Technologies in Schools", order: 3 },
        ],
        correctPairs: [{ leftId: 1, rightId: 3 }],
      },
    ];

    for (const q of matchingData) {
      questionNumber++;
      await db.insert(testQuestions).values({
        sectionId: readingMatching.id,
        questionText: `<p><strong>Question ${questionNumber}:</strong> ${q.text}</p>`,
        questionType: "MATCHING",
        order: questionNumber,
        points: 1,
        metadata: {
          version: 2,
          leftItems: q.leftItems,
          rightItems: q.rightItems,
          correctPairs: q.correctPairs,
        },
      });
    }
    console.log(`  ✅ Created 3 Matching questions (Q18-Q20)\n`);

    console.log("✅ Part 3 completed! Run part 4 script next...");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

recreateAdmissionTestPart3();

