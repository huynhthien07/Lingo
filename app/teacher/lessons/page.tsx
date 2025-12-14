import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LessonList } from "@/components/teacher/lessons/lesson-list";

export default async function TeacherLessonsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Lesson Management</h2>
          <p className="text-gray-600 mt-1">Manage lessons, documents, and exercises</p>
        </div>
      </div>

      <LessonList />
    </div>
  );
}

