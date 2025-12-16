import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, challenges, lessons, challengeProgress } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { PracticeQuiz } from "@/components/student/practice-quiz";
import { WritingPractice } from "@/components/student/practice-writing";
import { SpeakingPractice } from "@/components/student/practice-speaking";

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
        orderBy: (questions, { asc }) => [asc(questions.order)],
        with: {
          options: {
            orderBy: (options, { asc }) => [asc(options.order)],
          },
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

  // Get all challenges in this lesson
  const allChallenges = await db.query.challenges.findMany({
    where: eq(challenges.lessonId, lessonIdNum),
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
  });

  // Get progress for all challenges
  const allProgress = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, userId),
  });

  // Debug: Log challenge type
  console.log("Challenge type:", challenge.type);

  // Route to appropriate component based on challenge type
  // Writing types: WRITING_TASK_1, WRITING_TASK_2, WRITING_PRACTICE
  if (challenge.type.startsWith("WRITING_")) {
    return (
      <WritingPractice
        challenge={challenge}
        allChallenges={allChallenges}
        allProgress={allProgress}
        courseId={courseIdNum}
        lessonId={lessonIdNum}
      />
    );
  }

  // Speaking types: SPEAKING_PART_1, SPEAKING_PART_2, SPEAKING_PART_3
  if (challenge.type.startsWith("SPEAKING_")) {
    return (
      <SpeakingPractice
        challenge={challenge}
        allChallenges={allChallenges}
        allProgress={allProgress}
        courseId={courseIdNum}
        lessonId={lessonIdNum}
      />
    );
  }

  // Default: Multiple choice quiz
  return (
    <PracticeQuiz
      challenge={challenge}
      allChallenges={allChallenges}
      allProgress={allProgress}
      courseId={courseIdNum}
      lessonId={lessonIdNum}
    />
  );
}

