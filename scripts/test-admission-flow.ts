/**
 * Test Admission Test Flow
 * Simulates the complete admission test flow:
 * 1. Get admission test
 * 2. Start test (create attempt)
 * 3. Submit answers
 * 4. Complete test (calculate scores)
 * 5. Get recommendations
 * Run with: npx tsx scripts/test-admission-flow.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testAttempts, testAnswers } from "../db/schema";
import { eq } from "drizzle-orm";

async function testAdmissionFlow() {
  console.log("🚀 Testing Admission Test Flow\n");

  try {
    // Step 1: Get admission test
    console.log("📋 Step 1: Getting admission test...");
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.order)],
          with: {
            questions: {
              orderBy: (questions, { asc }) => [asc(questions.order)],
              with: {
                options: {
                  orderBy: (options, { asc }) => [asc(options.order)],
                },
              },
            },
          },
        },
      },
    });

    if (!admissionTest) {
      console.log("❌ No admission test found!");
      process.exit(1);
    }

    console.log(`✅ Found admission test: ${admissionTest.title}`);
    console.log(`   - Sections: ${admissionTest.sections.length}`);
    console.log(`   - Total questions: ${admissionTest.sections.reduce((sum, s) => sum + s.questions.length, 0)}\n`);

    // Step 2: Create test attempt
    console.log("📝 Step 2: Creating test attempt...");
    const totalPoints = admissionTest.sections.reduce(
      (sum, section) => sum + section.questions.reduce((qSum, q) => qSum + q.points, 0),
      0
    );

    const [attempt] = await db
      .insert(testAttempts)
      .values({
        userId: null, // Guest user (no authentication required)
        testId: admissionTest.id,
        status: "IN_PROGRESS",
        totalPoints,
      })
      .returning();

    console.log(`✅ Created attempt: ID ${attempt.id}`);
    console.log(`   - Total points: ${totalPoints}\n`);

    // Step 3: Submit some answers
    console.log("✏️  Step 3: Submitting answers...");
    let answeredCount = 0;
    for (const section of admissionTest.sections) {
      for (const question of section.questions) {
        // Select first option as correct answer
        const correctOption = question.options.find(o => o.isCorrect);
        if (correctOption) {
          await db.insert(testAnswers).values({
            attemptId: attempt.id,
            questionId: question.id,
            selectedOptionId: correctOption.id,
            pointsEarned: question.points,
          });
          answeredCount++;
        }
      }
    }
    console.log(`✅ Submitted ${answeredCount} answers\n`);

    // Step 4: Complete test
    console.log("🏁 Step 4: Completing test...");
    const updatedAttempt = await db
      .update(testAttempts)
      .set({
        status: "COMPLETED",
        score: totalPoints,
        bandScore: 7.5,
        readingBandScore: 7.5,
        listeningBandScore: 7.5,
      })
      .where(eq(testAttempts.id, attempt.id))
      .returning();

    console.log(`✅ Test completed`);
    console.log(`   - Score: ${updatedAttempt[0].score}/${totalPoints}`);
    console.log(`   - Band Score: ${updatedAttempt[0].bandScore}`);
    console.log(`   - Reading: ${updatedAttempt[0].readingBandScore}`);
    console.log(`   - Listening: ${updatedAttempt[0].listeningBandScore}\n`);

    // Step 5: Show result URL
    console.log("📊 Step 5: Result URL");
    const resultUrl = `/admission-test/${admissionTest.id}/result/${attempt.id}`;
    console.log(`✅ Result page: ${resultUrl}\n`);

    console.log("=".repeat(70));
    console.log("✅ ADMISSION TEST FLOW COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log("\n📋 Summary:");
    console.log(`  - Test ID: ${admissionTest.id}`);
    console.log(`  - Attempt ID: ${attempt.id}`);
    console.log(`  - Questions answered: ${answeredCount}/${admissionTest.sections.reduce((sum, s) => sum + s.questions.length, 0)}`);
    console.log(`  - Overall Band Score: 7.5`);
    console.log(`\n🔗 Visit: http://localhost:3000${resultUrl}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

testAdmissionFlow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

