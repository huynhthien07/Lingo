/**
 * Seed Admission Test with IELTS Listening and Reading sections
 * Run with: tsx scripts/seed-admission-test.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function seedAdmissionTest() {
  console.log("🚀 Starting Admission Test seeding...");

  try {
    // Find or create admission test
    let admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("📝 No admission test found. Creating new admission test...");

      // Create new admission test
      const [newTest] = await db
        .insert(tests)
        .values({
          title: "IELTS Admission Test",
          description: "Complete IELTS placement test with Listening and Reading sections to assess your English proficiency level and get personalized course recommendations.",
          imageSrc: "/ielts-test.svg",
          testType: "ADMISSION_TEST",
          examType: "IELTS",
          duration: 60,
          isAdmission: true,
          createdBy: null, // System-created test
        })
        .returning();

      admissionTest = newTest;
      console.log(`✅ Created admission test: ${admissionTest.title} (ID: ${admissionTest.id})`);
    } else {
      console.log(`✅ Found admission test: ${admissionTest.title} (ID: ${admissionTest.id})`);
    }

    // Update test duration to 60 minutes
    await db
      .update(tests)
      .set({ duration: 60 })
      .where(eq(tests.id, admissionTest.id));

    console.log("✅ Updated test duration to 60 minutes");

    // Delete existing sections and questions (cascade will handle questions)
    await db.delete(testSections).where(eq(testSections.testId, admissionTest.id));
    console.log("🗑️  Cleared existing sections");

    // Create Listening sections (4 sections × 10 questions = 40 questions)
    const listeningSections = [
      {
        title: "Listening Section 1 - Social Conversation",
        description: "Conversation about everyday situations (booking, form filling, numbers)",
        difficulty: "Easy",
      },
      {
        title: "Listening Section 2 - Social Monologue",
        description: "Monologue about everyday situations (introduction, guidance)",
        difficulty: "Medium",
      },
      {
        title: "Listening Section 3 - Academic Conversation",
        description: "Conversation in academic context (student-teacher discussion)",
        difficulty: "Hard",
      },
      {
        title: "Listening Section 4 - Academic Lecture",
        description: "Academic lecture or presentation",
        difficulty: "Very Hard",
      },
    ];

    console.log("\n📻 Creating Listening sections...");
    for (let i = 0; i < listeningSections.length; i++) {
      const sectionData = listeningSections[i];
      const [section] = await db
        .insert(testSections)
        .values({
          testId: admissionTest.id,
          title: sectionData.title,
          skillType: "LISTENING",
          order: i + 1,
          duration: null, // No individual section duration
          passage: null,
          imageSrc: null,
          audioSrc: null, // Will be added later
        })
        .returning();

      console.log(`  ✅ Created: ${section.title}`);

      // Create 10 questions for this section
      for (let q = 1; q <= 10; q++) {
        const questionNumber = i * 10 + q;
        const [question] = await db
          .insert(testQuestions)
          .values({
            sectionId: section.id,
            questionText: `Question ${questionNumber}: [Placeholder - Add actual question]`,
            imageSrc: null,
            audioSrc: null,
            order: q,
            points: 1,
          })
          .returning();

        // Create 4 options for each question (Multiple Choice)
        const options = ["A", "B", "C", "D"];
        for (let o = 0; o < options.length; o++) {
          await db.insert(testQuestionOptions).values({
            questionId: question.id,
            optionText: `Option ${options[o]}: [Placeholder]`,
            isCorrect: o === 0, // First option is correct by default
            order: o + 1,
          });
        }
      }

      console.log(`    ✅ Added 10 questions to ${section.title}`);
    }

    console.log("\n📚 Creating Reading sections...");
    // Create Reading sections (3 passages × ~13-14 questions = 40 questions)
    const readingSections = [
      {
        title: "Reading Passage 1",
        description: "General interest topic",
        difficulty: "Easy",
        questionCount: 13,
      },
      {
        title: "Reading Passage 2",
        description: "Work-related or academic topic",
        difficulty: "Medium",
        questionCount: 13,
      },
      {
        title: "Reading Passage 3",
        description: "Complex academic topic",
        difficulty: "Hard",
        questionCount: 14,
      },
    ];

    let totalReadingQuestions = 0;
    for (let i = 0; i < readingSections.length; i++) {
      const sectionData = readingSections[i];
      const [section] = await db
        .insert(testSections)
        .values({
          testId: admissionTest.id,
          title: sectionData.title,
          skillType: "READING",
          order: i + 5, // After 4 listening sections
          duration: null,
          passage: `[Placeholder - Add reading passage ${i + 1}]\n\nThis is where the reading passage content will go. It should be approximately 700-900 words for IELTS Academic Reading.`,
          imageSrc: null,
          audioSrc: null,
        })
        .returning();

      console.log(`  ✅ Created: ${section.title}`);

      // Create questions for this section
      for (let q = 1; q <= sectionData.questionCount; q++) {
        const questionNumber = totalReadingQuestions + q;
        const [question] = await db
          .insert(testQuestions)
          .values({
            sectionId: section.id,
            questionText: `Question ${questionNumber}: [Placeholder - Add actual question]`,
            imageSrc: null,
            audioSrc: null,
            order: q,
            points: 1,
          })
          .returning();

        // Create 4 options for each question
        const options = ["A", "B", "C", "D"];
        for (let o = 0; o < options.length; o++) {
          await db.insert(testQuestionOptions).values({
            questionId: question.id,
            optionText: `Option ${options[o]}: [Placeholder]`,
            isCorrect: o === 0, // First option is correct by default
            order: o + 1,
          });
        }
      }

      totalReadingQuestions += sectionData.questionCount;
      console.log(`    ✅ Added ${sectionData.questionCount} questions to ${section.title}`);
    }

    console.log("\n✅ Admission Test seeding completed!");
    console.log("\n📊 Summary:");
    console.log(`  - Test: ${admissionTest.title}`);
    console.log(`  - Duration: 60 minutes`);
    console.log(`  - Listening: 4 sections × 10 questions = 40 questions`);
    console.log(`  - Reading: 3 passages × 13-14 questions = 40 questions`);
    console.log(`  - Total: 80 questions`);
    console.log("\n⚠️  Next steps:");
    console.log("  1. Add audio files for Listening sections");
    console.log("  2. Replace placeholder questions with actual IELTS questions");
    console.log("  3. Replace placeholder passages with actual reading texts");
    console.log("  4. Update correct answers for each question");

  } catch (error) {
    console.error("❌ Error seeding admission test:", error);
    throw error;
  }
}

// Run the seed function
seedAdmissionTest()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });


