import "dotenv/config";
import db from "@/db/drizzle";
import { users, courses, courseEnrollments, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🎓 Enrolling admin to all courses...\n");

  // Get admin user
  const adminUsers = await db.select().from(users).where(eq(users.role, "ADMIN"));
  
  if (adminUsers.length === 0) {
    console.log("❌ No admin user found. Please create an admin user first.");
    process.exit(1);
  }

  const admin = adminUsers[0];
  console.log(`👤 Found admin: ${admin.userId}`);

  // Get all courses
  const allCourses = await db.select().from(courses);
  console.log(`📚 Found ${allCourses.length} courses\n`);

  // Check if user progress exists, if not create it
  const existingProgress = await db.select().from(userProgress).where(eq(userProgress.userId, admin.userId));
  
  if (existingProgress.length === 0) {
    console.log("📊 Creating user progress for admin...");
    await db.insert(userProgress).values({
      userId: admin.userId,
      activeCourseId: allCourses[0]?.id || null,
      points: 0,
      level: 1,
    });
    console.log("✅ User progress created\n");
  }

  // Enroll admin to all courses
  for (const course of allCourses) {
    // Check if already enrolled
    const existingEnrollment = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, admin.userId))
      .where(eq(courseEnrollments.courseId, course.id));

    if (existingEnrollment.length > 0) {
      console.log(`⏭️  Already enrolled in: ${course.title}`);
      continue;
    }

    // Enroll admin
    await db.insert(courseEnrollments).values({
      userId: admin.userId,
      courseId: course.id,
      enrollmentType: "FREE" as const,
      status: "ACTIVE" as const,
      progress: 0,
    });

    console.log(`✅ Enrolled in: ${course.title}`);
  }

  console.log("\n✅ Admin enrolled to all courses successfully!");
  console.log("👋 You can now access the student area!");
}

main()
  .catch((error) => {
    console.error("❌ Error enrolling admin:", error);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });

