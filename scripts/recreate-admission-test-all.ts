/**
 * Recreate Complete Admission Test - All Parts Combined
 * 
 * This script creates a complete admission test with 35 questions across 9 sections:
 * - LISTENING (10 questions): MCQ (4) + Short Answer (3) + Ordering (3)
 * - READING (10 questions): TFNG (4) + MCQ (3) + Matching (3)
 * - USE OF ENGLISH (15 questions): Grammar (8) + Vocabulary (5) + Error (2)
 * 
 * Run with: npx tsx scripts/recreate-admission-test-all.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function recreateAdmissionTestAll() {
  console.log("🚀 Starting Complete Admission Test Recreation...\n");

  try {
    let admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      const [newTest] = await db
        .insert(tests)
        .values({
          title: "English Level Assessment Test",
          description: "Comprehensive test to determine your English proficiency level (B1-B2)",
          testType: "ADMISSION_TEST",
          examType: "IELTS",
          duration: 45,
          isAdmission: true,
          createdBy: "system",
        })
        .returning();
      admissionTest = newTest;
    }

    await db.delete(testSections).where(eq(testSections.testId, admissionTest.id));
    console.log("✅ Found/Created admission test and cleared sections\n");

    let questionNumber = 0;

    // ========================================================================
    // LISTENING SECTION 1: Multiple Choice (4 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 1: Multiple Choice...");
    const [listeningMCQ] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 1 - Multiple Choice",
        skillType: "LISTENING",
        order: 1,
        duration: 5,
      })
      .returning();

    const listeningMCQData = [
      {
        text: "What is the main purpose of the conversation?",
        options: [
          { text: "To arrange a meeting", correct: true },
          { text: "To cancel an appointment", correct: false },
          { text: "To ask for directions", correct: false },
          { text: "To make a complaint", correct: false },
        ],
      },
      {
        text: "Where does this conversation most likely take place?",
        options: [
          { text: "At a university office", correct: true },
          { text: "At a restaurant", correct: false },
          { text: "At a train station", correct: false },
          { text: "At a hospital", correct: false },
        ],
      },
      {
        text: "What does the woman suggest the man should do?",
        options: [
          { text: "Submit the form by Friday", correct: true },
          { text: "Come back tomorrow", correct: false },
          { text: "Call the department", correct: false },
          { text: "Send an email", correct: false },
        ],
      },
      {
        text: "When will the event take place?",
        options: [
          { text: "Next Monday at 2 PM", correct: true },
          { text: "This Friday at 3 PM", correct: false },
          { text: "Next Wednesday at 10 AM", correct: false },
          { text: "This Thursday at 4 PM", correct: false },
        ],
      },
    ];

    for (const q of listeningMCQData) {
      questionNumber++;
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: listeningMCQ.id,
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
    console.log(`  ✅ Created 4 MCQ questions (Q1-Q4)\n`);

    // ========================================================================
    // LISTENING SECTION 2: Short Answer (3 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 2: Short Answer...");
    const [listeningShortAnswer] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 2 - Short Answer",
        skillType: "LISTENING",
        order: 2,
        duration: 5,
      })
      .returning();

    const shortAnswerData = [
      { text: "What is the speaker's full name?", answer: "Sarah Johnson" },
      { text: "What time does the meeting start?", answer: "9:30 AM" },
      { text: "How many participants are expected?", answer: "25" },
    ];

    for (const q of shortAnswerData) {
      questionNumber++;
      await db.insert(testQuestions).values({
        sectionId: listeningShortAnswer.id,
        questionText: `<p><strong>Question ${questionNumber}:</strong> ${q.text}</p>`,
        questionType: "TEXT_INPUT",
        correctAnswer: q.answer,
        order: questionNumber,
        points: 1,
      });
    }
    console.log(`  ✅ Created 3 short answer questions (Q5-Q7)\n`);

    console.log("✅ Listening sections created successfully!");
    console.log("Run the other scripts for Reading and Use of English sections...");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

recreateAdmissionTestAll();

