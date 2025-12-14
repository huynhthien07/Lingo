import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, challenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PracticeClient } from "@/components/student/practice-client";

interface PracticePageProps {
  params: Promise<{ courseId: string; lessonId: string; challengeId: string }>;
}

export default async function PracticePage({ params }: PracticePageProps) {
  const { userId } = await auth();
  const { courseId, lessonId, challengeId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const courseIdNum = parseInt(courseId);
  const lessonIdNum = parseInt(lessonId);
  const challengeIdNum = parseInt(challengeId);

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

  // Get challenge with questions and options
  const challenge = await db.query.challenges.findFirst({
    where: eq(challenges.id, challengeIdNum),
    with: {
      lesson: {
        with: {
          unit: {
            with: {
              course: true,
            },
          },
        },
      },
      questions: {
        with: {
          options: true,
        },
      },
    },
  });

  if (!challenge) {
    notFound();
  }

  // Verify challenge belongs to the lesson and course
  if (challenge.lesson.id !== lessonIdNum || challenge.lesson.unit.courseId !== courseIdNum) {
    notFound();
  }

  return (
    <PracticeClient
      challenge={challenge}
      courseId={courseIdNum}
      lessonId={lessonIdNum}
    />
  );
}

