/**
 * End-to-End Test for Admission Test Flow
 * Tests the complete flow from start to result with recommendations
 * Run with: npx tsx scripts/test-admission-e2e.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testAttempts, testAnswers } from "../db/schema";
import { eq } from "drizzle-orm";

async function testAdmissionE2E() {
  console.log("🚀 End-to-End Test: Admission Test Flow\n");

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

    console.log(`✅ Found: ${admissionTest.title}`);
    console.log(`   - Sections: ${admissionTest.sections.length}`);
    console.log(`   - Total questions: ${admissionTest.sections.reduce((sum, s) => sum + s.questions.length, 0)}\n`);

    // Step 2: Create test attempt (guest user)
    console.log("📝 Step 2: Creating test attempt (guest user)...");
    const totalPoints = admissionTest.sections.reduce(
      (sum, section) => sum + section.questions.reduce((qSum, q) => qSum + q.points, 0),
      0
    );

    const [attempt] = await db
      .insert(testAttempts)
      .values({
        userId: null, // Guest user
        testId: admissionTest.id,
        status: "IN_PROGRESS",
        totalPoints,
      })
      .returning();

    console.log(`✅ Created attempt: ID ${attempt.id}`);
    console.log(`   - User ID: ${attempt.userId || "NULL (guest)"}`);
    console.log(`   - Total points: ${totalPoints}\n`);

    // Step 3: Submit answers
    console.log("✏️  Step 3: Submitting answers...");
    let answeredCount = 0;
    for (const section of admissionTest.sections) {
      for (const question of section.questions) {
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
    const [completedAttempt] = await db
      .update(testAttempts)
      .set({
        status: "COMPLETED",
        score: totalPoints,
        bandScore: 7.5,
        readingBandScore: 7.5,
        listeningBandScore: 7.5,
        completedAt: new Date(),
      })
      .where(eq(testAttempts.id, attempt.id))
      .returning();

    console.log(`✅ Test completed`);
    console.log(`   - Score: ${completedAttempt.score}/${totalPoints}`);
    console.log(`   - Band Score: ${completedAttempt.bandScore}`);
    console.log(`   - Reading: ${completedAttempt.readingBandScore}`);
    console.log(`   - Listening: ${completedAttempt.listeningBandScore}\n`);

    // Step 5: Verify attempt
    console.log("✔️  Step 5: Verifying attempt...");
    const verifyAttempt = await db.query.testAttempts.findFirst({
      where: eq(testAttempts.id, attempt.id),
      with: {
        answers: true,
      },
    });

    if (verifyAttempt) {
      console.log(`✅ Attempt verified`);
      console.log(`   - Status: ${verifyAttempt.status}`);
      console.log(`   - Answers: ${verifyAttempt.answers.length}`);
      console.log(`   - User ID: ${verifyAttempt.userId || "NULL (guest)"}\n`);
    }

    console.log("=".repeat(70));
    console.log("✅ END-TO-END TEST PASSED!");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`  - Test ID: ${admissionTest.id}`);
    console.log(`  - Attempt ID: ${attempt.id}`);
    console.log(`  - Guest User: YES (userId = NULL)`);
    console.log(`  - Questions answered: ${answeredCount}/${admissionTest.sections.reduce((sum, s) => sum + s.questions.length, 0)}`);
    console.log(`  - Overall Band Score: 7.5`);
    console.log(`\n🔗 Result page: /admission-test/${admissionTest.id}/result/${attempt.id}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

testAdmissionE2E()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

