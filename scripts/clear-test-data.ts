import "dotenv/config";
import db from "@/db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions, testAttempts, testAnswers } from "@/db/schema";

async function clearTestData() {
  try {
    console.log("🗑️  Clearing all test data...");

    // Delete in correct order (child tables first due to foreign keys)
    await db.delete(testAnswers);
    console.log("✓ Deleted test answers");

    await db.delete(testAttempts);
    console.log("✓ Deleted test attempts");

    await db.delete(testQuestionOptions);
    console.log("✓ Deleted test question options");

    await db.delete(testQuestions);
    console.log("✓ Deleted test questions");

    await db.delete(testSections);
    console.log("✓ Deleted test sections");

    await db.delete(tests);
    console.log("✓ Deleted tests");

    console.log("✅ All test data cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing test data:", error);
    process.exit(1);
  }
}

clearTestData();

