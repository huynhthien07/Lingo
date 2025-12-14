import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseList } from "@/components/teacher/courses/course-list";

export default async function TeacherCoursesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Course Management</h2>
          <p className="text-gray-600 mt-1">Manage your courses, pricing, and enrollment</p>
        </div>
      </div>

      <CourseList />
    </div>
  );
}

