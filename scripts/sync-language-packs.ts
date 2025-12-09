/**
 * Sync Language Packs from Config to Database
 * 
 * This script reads language packs from lib/config/language-packs.ts
 * and syncs them to the database.
 * 
 * Usage: npx tsx scripts/sync-language-packs.ts
 */

import { db } from "@/db/drizzle";
import { languagePacks } from "@/db/schema";
import { LANGUAGE_PACKS } from "@/lib/config/language-packs";
import { eq, and } from "drizzle-orm";

async function syncLanguagePacks() {
  console.log("🌐 Starting language packs sync...");
  console.log(`📦 Found ${LANGUAGE_PACKS.length} language packs in config`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const pack of LANGUAGE_PACKS) {
    try {
      // Check if pack already exists
      const existing = await db.query.languagePacks.findFirst({
        where: and(
          eq(languagePacks.locale, pack.locale),
          eq(languagePacks.namespace, pack.namespace),
          eq(languagePacks.key, pack.key)
        ),
      });

      if (existing) {
        // Update if value changed
        if (existing.value !== pack.value) {
          await db
            .update(languagePacks)
            .set({
              value: pack.value,
              updatedAt: new Date(),
            })
            .where(eq(languagePacks.id, existing.id));
          
          console.log(`✏️  Updated: ${pack.locale}.${pack.namespace}.${pack.key}`);
          updated++;
        } else {
          skipped++;
        }
      } else {
        // Create new pack
        await db.insert(languagePacks).values({
          locale: pack.locale,
          namespace: pack.namespace,
          key: pack.key,
          value: pack.value,
        });
        
        console.log(`✅ Created: ${pack.locale}.${pack.namespace}.${pack.key}`);
        created++;
      }
    } catch (error) {
      console.error(`❌ Error syncing ${pack.locale}.${pack.namespace}.${pack.key}:`, error);
    }
  }

  console.log("\n📊 Sync Summary:");
  console.log(`   ✅ Created: ${created}`);
  console.log(`   ✏️  Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   📦 Total: ${LANGUAGE_PACKS.length}`);
  console.log("\n✨ Language packs sync completed!");
}

// Run the sync
syncLanguagePacks()
  .then(() => {
    console.log("✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

