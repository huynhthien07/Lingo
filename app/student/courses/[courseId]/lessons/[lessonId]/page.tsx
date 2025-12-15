import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, lessons, lessonProgress, challengeProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { LessonViewClient } from "@/components/student/lesson-view-client";

interface LessonDetailPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function StudentLessonDetailPage({ params }: LessonDetailPageProps) {
  const { userId } = await auth();
  const { courseId, lessonId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const courseIdNum = parseInt(courseId);
  const lessonIdNum = parseInt(lessonId);

  // Check enrollment
  const enrollment = await db.query.courseEnrollments.findFirst({
    where: and(
      eq(courseEnrollments.userId, userId),
      eq(courseEnrollments.courseId, courseIdNum)
    ),
  });

  if (!enrollment) {
    redirect("/courses-public");
  }

  // Get lesson with challenges
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonIdNum),
    with: {
      unit: {
        with: {
          course: true,
        },
      },
      challenges: {
        orderBy: (challenges, { asc }) => [asc(challenges.order)],
        with: {
          questions: {
            orderBy: (questions, { asc }) => [asc(questions.order)],
            with: {
              options: {
                orderBy: (options, { asc }) => [asc(options.order)],
              },
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Verify lesson belongs to the course
  if (lesson.unit.courseId !== courseIdNum) {
    notFound();
  }

  // Get lesson progress
  const progress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, lessonIdNum)
    ),
  });

  // Get challenge progress for all challenges in this lesson
  const challengeIds = lesson.challenges.map(c => c.id);

  // Fetch all challenge progress for this user
  const allChallengesProgress = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, userId),
  });

  // Filter to only challenges in this lesson that are completed
  const completedChallenges = allChallengesProgress.filter(cp =>
    challengeIds.includes(cp.challengeId) && cp.completed
  ).length;

  return (
    <LessonViewClient
      lesson={lesson}
      courseId={courseIdNum}
      isCompleted={progress?.completed || false}
      completedChallenges={completedChallenges}
      totalChallenges={lesson.challenges.length}
    />
  );
}

