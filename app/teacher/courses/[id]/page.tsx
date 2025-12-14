import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseDetailView } from "@/components/teacher/courses/course-detail-view";
import db from "@/db/drizzle";
import { courses, teacherAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface CourseDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const courseId = parseInt(id);

  // Validate courseId
  if (isNaN(courseId)) {
    redirect("/teacher/courses");
  }

  // Check if teacher is assigned to this course first
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, courseId),
      eq(teacherAssignments.teacherId, userId)
    ),
  });

  if (!assignment) {
    console.log(`Teacher ${userId} not assigned to course ${courseId}`);
    redirect("/teacher/courses");
  }

  // Get course
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    console.log(`Course ${courseId} not found`);
    redirect("/teacher/courses");
  }

  return (
    <div className="space-y-6">
      <CourseDetailView courseId={courseId} initialCourse={course} />
    </div>
  );
}

