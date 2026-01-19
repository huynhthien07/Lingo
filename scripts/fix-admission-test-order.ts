/**
 * Fix Admission Test Section Order
 * Corrects the order of all sections to be sequential
 * Run with: npx tsx scripts/fix-admission-test-order.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests, testSections } from "../db/schema";
import { eq } from "drizzle-orm";

async function fixAdmissionTestOrder() {
  console.log("🚀 Fixing Admission Test Section Order...\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.order)],
        },
      },
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found!");
      process.exit(1);
    }

    console.log(`📋 Found ${admissionTest.sections.length} sections\n`);
    console.log("🔄 Updating section order...\n");

    // Update each section with correct sequential order
    for (let i = 0; i < admissionTest.sections.length; i++) {
      const section = admissionTest.sections[i];
      const newOrder = i + 1;

      if (section.order !== newOrder) {
        await db
          .update(testSections)
          .set({ order: newOrder })
          .where(eq(testSections.id, section.id));

        console.log(`  ✅ Section ${i + 1}: "${section.title}" (was order ${section.order}, now ${newOrder})`);
      } else {
        console.log(`  ✓ Section ${i + 1}: "${section.title}" (order ${newOrder}) - OK`);
      }
    }

    console.log("\n✅ Section order fixed successfully!");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

fixAdmissionTestOrder()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

