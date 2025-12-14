import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { courses, teacherAssignments } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function DebugPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get all courses
  const allCourses = await db.select().from(courses);

  // Get teacher assignments for current user
  const assignments = await db
    .select()
    .from(teacherAssignments)
    .where(eq(teacherAssignments.teacherId, userId));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Debug Information</h1>

      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Current User ID</h2>
        <code className="bg-gray-100 px-2 py-1 rounded">{userId}</code>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">All Courses ({allCourses.length})</h2>
        <div className="space-y-2">
          {allCourses.map((course) => (
            <div key={course.id} className="border-b pb-2">
              <p className="font-medium">
                {course.id}. {course.title}
              </p>
              <p className="text-sm text-gray-600">
                {course.examType} - {course.level}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">
          Teacher Assignments ({assignments.length})
        </h2>
        <div className="space-y-2">
          {assignments.map((assignment) => (
            <div key={assignment.id} className="border-b pb-2">
              <p className="text-sm">
                Course ID: {assignment.courseId} - Teacher ID: {assignment.teacherId}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Assigned Course IDs</h2>
        <code className="bg-gray-100 px-2 py-1 rounded">
          {JSON.stringify(assignments.map((a) => a.courseId))}
        </code>
      </div>
    </div>
  );
}

