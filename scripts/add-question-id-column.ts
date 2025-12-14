/**
 * Add question_id column to challenge_options table
 * Run with: npx tsx scripts/add-question-id-column.ts
 */

import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL!);

async function addQuestionIdColumn() {
  console.log("🔧 Adding question_id column to challenge_options table...");

  try {
    // Add question_id column
    await sql`
      ALTER TABLE challenge_options 
      ADD COLUMN IF NOT EXISTS question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE
    `;
    console.log("✅ Added question_id column");

    // Create index
    await sql`
      CREATE INDEX IF NOT EXISTS idx_challenge_options_question_id 
      ON challenge_options(question_id)
    `;
    console.log("✅ Created index on question_id");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

addQuestionIdColumn();

