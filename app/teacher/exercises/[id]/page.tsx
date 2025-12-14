import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTeacherExerciseById } from "@/lib/controllers/teacher/exercise.controller";
import { ExerciseDetailView } from "@/components/teacher/exercises/exercise-detail-view";

interface ExerciseDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDetailPage({ params }: ExerciseDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const exerciseId = parseInt(id);

  if (isNaN(exerciseId)) {
    redirect("/teacher/exercises");
  }

  let exercise = null;
  try {
    exercise = await getTeacherExerciseById(exerciseId, userId);
  } catch (error) {
    console.error("Error fetching exercise:", error);
  }

  return (
    <div className="space-y-6">
      <ExerciseDetailView exerciseId={exerciseId} initialExercise={exercise} />
    </div>
  );
}

