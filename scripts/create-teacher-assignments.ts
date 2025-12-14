import "dotenv/config";
import db from "@/db/drizzle";
import { courses, teacherAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("🔧 Creating teacher assignments for courses...\n");

  // Get all courses
  const allCourses = await db.select().from(courses);

  console.log(`📚 Found ${allCourses.length} courses\n`);

  let created = 0;
  let skipped = 0;

  for (const course of allCourses) {
    // Check if assignment already exists
    const existingAssignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, course.id),
        eq(teacherAssignments.teacherId, course.createdBy)
      ),
    });

    if (existingAssignment) {
      console.log(`⏭️  Assignment already exists for: ${course.title}`);
      skipped++;
      continue;
    }

    // Create assignment
    await db.insert(teacherAssignments).values({
      teacherId: course.createdBy,
      courseId: course.id,
    });

    console.log(`✅ Created assignment for: ${course.title} (Teacher: ${course.createdBy})`);
    created++;
  }

  console.log(`\n✅ Created ${created} teacher assignments`);
  console.log(`⏭️  Skipped ${skipped} existing assignments`);
  console.log("\n✅ Teacher assignments created successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Error creating teacher assignments:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

