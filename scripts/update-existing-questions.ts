/**
 * Update existing TEXT_INPUT questions with correct answers
 * Run with: npx tsx scripts/update-existing-questions.ts
 * 
 * NOTE: This is a template script. You need to customize it with your actual questions.
 */

import "dotenv/config";
import db from "../db/drizzle";
import { testQuestions } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("🔄 Updating existing TEXT_INPUT questions...\n");

  try {
    // Get all TEXT_INPUT questions without correct answers
    const questions = await db
      .select()
      .from(testQuestions)
      .where(
        and(
          eq(testQuestions.questionType, "TEXT_INPUT"),
          // Only get questions without correct answers
        )
      );

    console.log(`📊 Found ${questions.length} TEXT_INPUT questions\n`);

    if (questions.length === 0) {
      console.log("✅ No questions to update!");
      return;
    }

    // Display questions that need updating
    console.log("📝 Questions that need correct answers:");
    questions.forEach((q, index) => {
      console.log(`\n${index + 1}. Question ID: ${q.id}`);
      console.log(`   Text: ${q.questionText}`);
      console.log(`   Current correct_answer: ${q.correctAnswer || '(not set)'}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("⚠️  MANUAL UPDATE REQUIRED");
    console.log("=".repeat(60));
    console.log("\nTo update these questions, run SQL commands like:");
    console.log("\nUPDATE test_questions");
    console.log("SET correct_answer = 'Your Answer Here',");
    console.log("    explanation = 'Optional explanation'");
    console.log("WHERE id = <question_id>;");
    console.log("\nOr update them through the teacher UI.");

    // Example: Update specific questions (uncomment and customize)
    /*
    console.log("\n🔄 Updating questions...");
    
    // Example 1: Update question with ID 1
    await db
      .update(testQuestions)
      .set({
        correctAnswer: "Paris",
        explanation: "Paris is the capital of France"
      })
      .where(eq(testQuestions.id, 1));
    console.log("✅ Updated question 1");

    // Example 2: Update question with ID 2
    await db
      .update(testQuestions)
      .set({
        correctAnswer: "London",
        explanation: "London is the capital of the United Kingdom"
      })
      .where(eq(testQuestions.id, 2));
    console.log("✅ Updated question 2");

    console.log("\n✅ All questions updated!");
    */

  } catch (error) {
    console.error("❌ Update failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });

