/**
 * Run SQL migration to add challenge_id columns
 * Run with: npx tsx scripts/run-sql-migration.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔄 Running SQL migration: add_challenge_id_to_question_pools\n");

  try {
    // Add challenge_id to question_labels
    console.log("1️⃣ Adding challenge_id to question_labels...");
    await db.execute(sql`
      ALTER TABLE question_labels
      ADD COLUMN IF NOT EXISTS challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE
    `);
    console.log("✅ Done\n");

    // Add challenge_id to question_items
    console.log("2️⃣ Adding challenge_id to question_items...");
    await db.execute(sql`
      ALTER TABLE question_items
      ADD COLUMN IF NOT EXISTS challenge_id INTEGER REFERENCES challenges(id) ON DELETE CASCADE
    `);
    console.log("✅ Done\n");

    // Create index for question_labels
    console.log("3️⃣ Creating index for question_labels...");
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_question_labels_challenge_id ON question_labels(challenge_id)
    `);
    console.log("✅ Done\n");

    // Create index for question_items
    console.log("4️⃣ Creating index for question_items...");
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_question_items_challenge_id ON question_items(challenge_id)
    `);
    console.log("✅ Done\n");

    console.log("✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - Added challenge_id to question_labels");
    console.log("  - Added challenge_id to question_items");
    console.log("  - Created indexes for better performance");
    console.log("\n🎯 Next steps:");
    console.log("  1. Run: npx tsx scripts/migrate-lesson-to-challenge-pool.ts");
    console.log("  2. This will migrate existing data from lessonId to challengeId");

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

