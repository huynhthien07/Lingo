import "dotenv/config";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { like, or, sql } from "drizzle-orm";

async function main() {
  console.log("🔧 Fixing course image paths...\n");

  // Get all courses
  const allCourses = await db.select().from(courses);

  console.log(`📚 Found ${allCourses.length} courses\n`);

  let updated = 0;

  for (const course of allCourses) {
    // Check if imageSrc is invalid (contains absolute path or /courses/)
    const isInvalid =
      course.imageSrc.includes("\\") ||
      course.imageSrc.includes("T:") ||
      course.imageSrc.startsWith("/courses/") ||
      course.imageSrc.includes("uploads/images/");

    if (isInvalid) {
      await db
        .update(courses)
        .set({ imageSrc: "/mascot.svg" })
        .where(sql`${courses.id} = ${course.id}`);

      console.log(`✅ Updated: ${course.title}`);
      console.log(`   Old: ${course.imageSrc}`);
      console.log(`   New: /mascot.svg\n`);
      updated++;
    } else {
      console.log(`⏭️  OK: ${course.title} (${course.imageSrc})`);
    }
  }

  console.log(`\n✅ Updated ${updated} courses`);
  console.log("✅ Course images fixed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error fixing course images:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

