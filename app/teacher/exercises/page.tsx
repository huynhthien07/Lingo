import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ExerciseList } from "@/components/teacher/exercises/exercise-list";

export default async function TeacherExercisesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Exercise Management</h2>
          <p className="text-gray-600 mt-1">Manage exercises and practice questions</p>
        </div>
      </div>

      <ExerciseList />
    </div>
  );
}

