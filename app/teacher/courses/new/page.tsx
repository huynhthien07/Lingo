import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CreateCourseForm } from "@/components/teacher/courses/create-course-form";

export default async function NewCoursePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Create New Course</h2>
        <p className="text-gray-600 mt-1">Add a new course to your teaching portfolio</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CreateCourseForm />
      </div>
    </div>
  );
}

