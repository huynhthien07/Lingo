/**
 * Recreate Admission Test - Part 2: Listening Ordering + Reading
 * Run with: npx tsx scripts/recreate-admission-test-part2.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "../db/schema";
import { eq } from "drizzle-orm";

async function recreateAdmissionTestPart2() {
  console.log("🚀 Starting Admission Test Part 2...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found. Run part 1 first!");
      process.exit(1);
    }

    let questionNumber = 7; // Continue from Q7

    // ========================================================================
    // LISTENING SECTION 3: Ordering (3 questions)
    // ========================================================================
    console.log("📝 Creating LISTENING Section 3: Ordering...");
    const [listeningOrdering] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Listening Part 3 - Ordering",
        skillType: "LISTENING",
        order: 3,
        duration: 5,
      })
      .returning();

    const orderingData = [
      {
        text: "Arrange the steps in the correct order according to the speaker:",
        items: [
          { id: 1, text: "Fill out the application form", order: 1 },
          { id: 2, text: "Submit required documents", order: 2 },
          { id: 3, text: "Attend the interview", order: 3 },
          { id: 4, text: "Wait for confirmation email", order: 4 },
        ],
      },
      {
        text: "Put the events in chronological order:",
        items: [
          { id: 1, text: "The company was founded", order: 1 },
          { id: 2, text: "First product launched", order: 2 },
          { id: 3, text: "Expanded to international markets", order: 3 },
        ],
      },
      {
        text: "Order the instructions correctly:",
        items: [
          { id: 1, text: "Turn on the device", order: 1 },
          { id: 2, text: "Select the program", order: 2 },
          { id: 3, text: "Press start button", order: 3 },
        ],
      },
    ];

    for (const q of orderingData) {
      questionNumber++;
      await db.insert(testQuestions).values({
        sectionId: listeningOrdering.id,
        questionText: `<p><strong>Question ${questionNumber}:</strong> ${q.text}</p>`,
        questionType: "ORDERING",
        order: questionNumber,
        points: 1,
        metadata: {
          version: 2,
          items: q.items,
          correctOrder: q.items.map(item => item.id),
        },
      });
    }
    console.log(`  ✅ Created 3 ordering questions (Q8-Q10)\n`);

    // ========================================================================
    // READING SECTION 4: True/False/Not Given (4 questions)
    // ========================================================================
    console.log("📝 Creating READING Section 4: True/False/Not Given...");
    
    const readingPassage = `
      <h3>The Impact of Technology on Modern Education</h3>
      <p><strong>Paragraph A:</strong> In recent years, technology has revolutionized the way we approach education. 
      From interactive whiteboards to online learning platforms, digital tools have become an integral part of the 
      modern classroom. Many educators believe that these innovations have made learning more engaging and accessible 
      to students of all backgrounds.</p>
      
      <p><strong>Paragraph B:</strong> However, the integration of technology in education is not without its challenges. 
      Some studies suggest that excessive screen time can negatively impact students' attention spans and social skills. 
      Additionally, not all students have equal access to technological resources, which can create a digital divide 
      between different socioeconomic groups.</p>
      
      <p><strong>Paragraph C:</strong> Despite these concerns, research conducted in 2022 at several universities showed 
      that students who used educational technology regularly performed 15% better on standardized tests compared to 
      those who relied solely on traditional methods. The study involved over 5,000 participants across different age 
      groups and educational levels.</p>
      
      <p><strong>Paragraph D:</strong> Looking ahead, experts predict that artificial intelligence and virtual reality 
      will play an increasingly important role in education. These technologies have the potential to create personalized 
      learning experiences that adapt to each student's individual needs and learning pace, making education more 
      effective and inclusive than ever before.</p>
    `;

    const [readingTFNG] = await db
      .insert(testSections)
      .values({
        testId: admissionTest.id,
        title: "Reading Part 1 - True/False/Not Given",
        skillType: "READING",
        order: 4,
        duration: 5,
        passage: readingPassage,
      })
      .returning();

    const tfngData = [
      {
        text: "Technology has made education more engaging and accessible.",
        options: [
          { text: "True", correct: true },
          { text: "False", correct: false },
          { text: "Not Given", correct: false },
        ],
      },
      {
        text: "All students have equal access to technological resources.",
        options: [
          { text: "True", correct: false },
          { text: "False", correct: true },
          { text: "Not Given", correct: false },
        ],
      },
      {
        text: "The 2022 study was conducted at universities in Europe.",
        options: [
          { text: "True", correct: false },
          { text: "False", correct: false },
          { text: "Not Given", correct: true },
        ],
      },
      {
        text: "Students using educational technology performed better on tests.",
        options: [
          { text: "True", correct: true },
          { text: "False", correct: false },
          { text: "Not Given", correct: false },
        ],
      },
    ];

    for (const q of tfngData) {
      questionNumber++;
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: readingTFNG.id,
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
    console.log(`  ✅ Created 4 TFNG questions (Q11-Q14)\n`);

    console.log("✅ Part 2 completed! Run part 3 script next...");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

recreateAdmissionTestPart2();

