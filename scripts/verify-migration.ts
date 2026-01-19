/**
 * Verify migration: Check if correctAnswer and explanation columns exist
 * Run with: npx tsx scripts/verify-migration.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🔍 Verifying migration...\n");

  try {
    // Check if columns exist
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'test_questions' 
        AND column_name IN ('correct_answer', 'explanation')
      ORDER BY column_name
    `);

    console.log("📊 Database Schema:");
    console.table(result.rows);

    if (result.rows.length === 2) {
      console.log("\n✅ Migration successful!");
      console.log("✅ Both columns exist in database:");
      console.log("  - correct_answer (TEXT)");
      console.log("  - explanation (TEXT)");
      
      console.log("\n🎯 Next steps:");
      console.log("  1. Update existing TEXT_INPUT questions with correct answers");
      console.log("  2. Test the validation by submitting answers");
      console.log("  3. Verify points are only awarded for correct answers");
    } else {
      console.log("\n❌ Migration incomplete!");
      console.log(`Found ${result.rows.length} columns, expected 2`);
    }

  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\n✅ Verification complete!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Verification failed:", error);
    process.exit(1);
  });

