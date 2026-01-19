/**
 * Migration script to add correctAnswer and explanation fields to test_questions table
 * Run with: npx tsx scripts/migrate-add-correct-answer.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔄 Running migration: Add correctAnswer and explanation to test_questions...\n");

  try {
    // Add correctAnswer column
    console.log("Adding correct_answer column...");
    await db.execute(sql`
      ALTER TABLE test_questions 
      ADD COLUMN IF NOT EXISTS correct_answer TEXT
    `);
    console.log("✅ Added correct_answer column");

    // Add explanation column
    console.log("Adding explanation column...");
    await db.execute(sql`
      ALTER TABLE test_questions 
      ADD COLUMN IF NOT EXISTS explanation TEXT
    `);
    console.log("✅ Added explanation column");

    // Add comments
    console.log("Adding column comments...");
    await db.execute(sql`
      COMMENT ON COLUMN test_questions.correct_answer IS 'Correct answer for TEXT_INPUT questions (e.g., fill-in-blank, short answer)'
    `);
    await db.execute(sql`
      COMMENT ON COLUMN test_questions.explanation IS 'Explanation for the correct answer'
    `);
    console.log("✅ Added column comments");

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - Added: test_questions.correct_answer (TEXT)");
    console.log("  - Added: test_questions.explanation (TEXT)");
    console.log("\n🎯 Next steps:");
    console.log("  1. TEXT_INPUT questions can now store correct answers");
    console.log("  2. Validation will check student answers against correctAnswer field");
    console.log("  3. Points will only be awarded for correct answers");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });

