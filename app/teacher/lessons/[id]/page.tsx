import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getTeacherLessonById } from "@/lib/controllers/teacher/lesson.controller";
import { LessonDetailView } from "@/components/teacher/lessons/lesson-detail-view";

interface LessonDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LessonDetailPage({ params }: LessonDetailPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { id } = await params;
  const lessonId = parseInt(id);

  if (isNaN(lessonId)) {
    redirect("/teacher/lessons");
  }

  let lesson = null;
  try {
    lesson = await getTeacherLessonById(lessonId, userId);
    console.log("Fetched lesson:", JSON.stringify(lesson, null, 2));
  } catch (error) {
    console.error("Error fetching lesson:", error);
  }

  if (!lesson) {
    console.log("Lesson is null or undefined");
  }

  return (
    <div className="space-y-6">
      <LessonDetailView lessonId={lessonId} initialLesson={lesson} />
    </div>
  );
}

