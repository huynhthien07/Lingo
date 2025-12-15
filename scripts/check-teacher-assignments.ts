import "dotenv/config";
import db from "@/db/drizzle";
import { courses, teacherAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkTeacherAssignments() {
  const adminUserId = "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY";
  
  // Get all courses
  const allCourses = await db.query.courses.findMany();
  
  console.log(`\n📚 Total courses: ${allCourses.length}\n`);
  
  for (const course of allCourses) {
    console.log(`Course ID ${course.id}: ${course.title}`);
    console.log(`  Created by: ${course.createdBy}`);
    
    // Check teacher assignments
    const assignments = await db.query.teacherAssignments.findMany({
      where: eq(teacherAssignments.courseId, course.id),
    });
    
    console.log(`  Teacher assignments: ${assignments.length}`);
    if (assignments.length > 0) {
      assignments.forEach(a => {
        console.log(`    - Teacher: ${a.teacherId}`);
      });
    }
    
    // Check if admin has assignment
    const adminAssignment = assignments.find(a => a.teacherId === adminUserId);
    console.log(`  Admin has access: ${!!adminAssignment ? '✅' : '❌'}`);
    console.log('');
  }
}

checkTeacherAssignments()
  .then(() => {
    console.log("✅ Done");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });

