/**
 * Migration script to migrate question pool data from lessonId to challengeId
 * This script finds all labels/items with lessonId but no challengeId,
 * and assigns them to the first challenge in that lesson.
 * 
 * Run with: npx tsx scripts/migrate-lesson-to-challenge-pool.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { questionLabels, questionItems, challenges } from "../db/schema";
import { eq, isNull, and } from "drizzle-orm";

async function main() {
  console.log("🔄 Migrating question pool data from lessonId to challengeId...\n");

  try {
    // Find all labels with lessonId but no challengeId
    const labelsToMigrate = await db.query.questionLabels.findMany({
      where: and(
        isNull(questionLabels.challengeId),
        isNull(questionLabels.testId)
      ),
    });

    console.log(`📊 Found ${labelsToMigrate.length} labels to migrate`);

    // Migrate each label
    for (const label of labelsToMigrate) {
      if (!label.lessonId) {
        console.log(`⚠️  Skipping label ${label.id} - no lessonId`);
        continue;
      }

      // Find first challenge in this lesson
      const firstChallenge = await db.query.challenges.findFirst({
        where: eq(challenges.lessonId, label.lessonId),
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
      });

      if (!firstChallenge) {
        console.log(`⚠️  No challenge found for lesson ${label.lessonId}, skipping label ${label.id}`);
        continue;
      }

      // Update label with challengeId
      await db
        .update(questionLabels)
        .set({ challengeId: firstChallenge.id })
        .where(eq(questionLabels.id, label.id));

      console.log(`✅ Migrated label ${label.id} to challenge ${firstChallenge.id}`);
    }

    // Find all items with lessonId but no challengeId
    const itemsToMigrate = await db.query.questionItems.findMany({
      where: and(
        isNull(questionItems.challengeId),
        isNull(questionItems.testId)
      ),
    });

    console.log(`\n📊 Found ${itemsToMigrate.length} items to migrate`);

    // Migrate each item
    for (const item of itemsToMigrate) {
      if (!item.lessonId) {
        console.log(`⚠️  Skipping item ${item.id} - no lessonId`);
        continue;
      }

      // Find first challenge in this lesson
      const firstChallenge = await db.query.challenges.findFirst({
        where: eq(challenges.lessonId, item.lessonId),
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
      });

      if (!firstChallenge) {
        console.log(`⚠️  No challenge found for lesson ${item.lessonId}, skipping item ${item.id}`);
        continue;
      }

      // Update item with challengeId
      await db
        .update(questionItems)
        .set({ challengeId: firstChallenge.id })
        .where(eq(questionItems.id, item.id));

      console.log(`✅ Migrated item ${item.id} to challenge ${firstChallenge.id}`);
    }

    console.log("\n✅ Migration completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`  - Migrated ${labelsToMigrate.length} labels`);
    console.log(`  - Migrated ${itemsToMigrate.length} items`);
    console.log("\n🎯 Next steps:");
    console.log("  1. Verify the migration by checking the database");
    console.log("  2. Test creating new questions with the Simple Editors");
    console.log("  3. Verify that labels/items are scoped to challenges");

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

