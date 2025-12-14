import "dotenv/config";
import db from "@/db/drizzle";
import { courses, units, lessons, challenges } from "@/db/schema";

async function clearCoursesData() {
  try {
    console.log("🗑️  Clearing courses and related data...");

    // Delete in correct order (child tables first due to foreign keys)
    await db.delete(challenges);
    console.log("✓ Deleted challenges");

    await db.delete(lessons);
    console.log("✓ Deleted lessons");

    await db.delete(units);
    console.log("✓ Deleted units");

    await db.delete(courses);
    console.log("✓ Deleted courses");

    console.log("✅ All courses data cleared successfully!");
    console.log("Now you can run: npx drizzle-kit push");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing courses data:", error);
    process.exit(1);
  }
}

clearCoursesData();

