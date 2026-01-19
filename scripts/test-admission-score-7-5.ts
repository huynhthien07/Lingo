/**
 * Test Admission Test with Score 7.5-8.0
 * Creates an admission test attempt with band score 7.5-8.0
 * to test course recommendations for advanced level students
 * Run with: npx tsx scripts/test-admission-score-7-5.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testAttempts, testAnswers } from "../db/schema";
import { eq } from "drizzle-orm";

async function testAdmissionScore75() {
  console.log("🚀 Testing Admission Test with Score 7.5-8.0\n");

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

    console.log(`✅ Found: ${admissionTest.title}\n`);

    // Step 2: Create test attempt
    console.log("📝 Step 2: Creating test attempt...");
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

    console.log(`✅ Created attempt: ID ${attempt.id}\n`);

    // Step 3: Submit answers - 85% correct to get ~7.5-8.0 band score
    console.log("✏️  Step 3: Submitting answers (85% correct)...");
    let answeredCount = 0;
    let correctCount = 0;

    for (const section of admissionTest.sections) {
      for (let i = 0; i < section.questions.length; i++) {
        const question = section.questions[i];
        const isCorrect = i % 7 !== 0; // 6 out of 7 are correct (~85%)

        if (isCorrect) {
          const correctOption = question.options.find(o => o.isCorrect);
          if (correctOption) {
            await db.insert(testAnswers).values({
              attemptId: attempt.id,
              questionId: question.id,
              selectedOptionId: correctOption.id,
              pointsEarned: question.points,
            });
            correctCount++;
          }
        } else {
          // Submit wrong answer
          const wrongOption = question.options.find(o => !o.isCorrect);
          if (wrongOption) {
            await db.insert(testAnswers).values({
              attemptId: attempt.id,
              questionId: question.id,
              selectedOptionId: wrongOption.id,
              pointsEarned: 0,
            });
          }
        }
        answeredCount++;
      }
    }

    const scoreEarned = Math.round((correctCount / answeredCount) * totalPoints);
    console.log(`✅ Submitted ${answeredCount} answers (${correctCount} correct)\n`);

    // Step 4: Complete test with 7.5-8.0 band score
    console.log("🏁 Step 4: Completing test...");
    const [completedAttempt] = await db
      .update(testAttempts)
      .set({
        status: "COMPLETED",
        score: scoreEarned,
        bandScore: 7.75,
        readingBandScore: 7.5,
        listeningBandScore: 8.0,
        completedAt: new Date(),
      })
      .where(eq(testAttempts.id, attempt.id))
      .returning();

    console.log(`✅ Test completed`);
    console.log(`   - Score: ${completedAttempt.score}/${totalPoints}`);
    console.log(`   - Band Score: ${completedAttempt.bandScore}`);
    console.log(`   - Reading: ${completedAttempt.readingBandScore}`);
    console.log(`   - Listening: ${completedAttempt.listeningBandScore}\n`);

    console.log("=".repeat(70));
    console.log("✅ TEST COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log("\n📊 Summary:");
    console.log(`  - Test ID: ${admissionTest.id}`);
    console.log(`  - Attempt ID: ${attempt.id}`);
    console.log(`  - Overall Band Score: 7.75 (Advanced level)`);
    console.log(`  - Reading Band: 7.5`);
    console.log(`  - Listening Band: 8.0`);
    console.log(`\n🔗 Result page: /admission-test/${admissionTest.id}/result/${attempt.id}`);
    console.log(`\n💡 This score should show advanced-level courses in recommendations`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

testAdmissionScore75()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

