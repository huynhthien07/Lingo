import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { writingSubmissions, speakingSubmissions, challenges, testSubmissions, tests, testQuestions, users } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import LearningHistoryClient from "@/components/student/learning-history-client";

export default async function LearningHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch writing submissions
  const writingSubmissionsData = await db.query.writingSubmissions.findMany({
    where: eq(writingSubmissions.userId, userId),
    orderBy: [desc(writingSubmissions.submittedAt)],
    with: {
      challenge: {
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
        },
      },
    },
  });

  // Fetch speaking submissions
  const speakingSubmissionsData = await db.query.speakingSubmissions.findMany({
    where: eq(speakingSubmissions.userId, userId),
    orderBy: [desc(speakingSubmissions.submittedAt)],
    with: {
      challenge: {
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
        },
      },
    },
  });

  // Fetch test submissions (speaking/writing tests)
  const testSubmissionsData = await db
    .select({
      id: testSubmissions.id,
      attemptId: testSubmissions.attemptId,
      testId: testSubmissions.testId,
      questionId: testSubmissions.questionId,
      skillType: testSubmissions.skillType,
      audioUrl: testSubmissions.audioUrl,
      textAnswer: testSubmissions.textAnswer,
      score: testSubmissions.score,
      maxScore: testSubmissions.maxScore,
      feedback: testSubmissions.feedback,
      status: testSubmissions.status,
      gradedAt: testSubmissions.gradedAt,
      createdAt: testSubmissions.createdAt,
      testTitle: tests.title,
      questionText: testQuestions.questionText,
      graderName: users.name,
    })
    .from(testSubmissions)
    .leftJoin(tests, eq(testSubmissions.testId, tests.id))
    .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
    .leftJoin(users, eq(testSubmissions.gradedBy, users.userId))
    .where(eq(testSubmissions.userId, userId))
    .orderBy(desc(testSubmissions.gradedAt));

  return (
    <LearningHistoryClient
      writingSubmissions={writingSubmissionsData}
      speakingSubmissions={speakingSubmissionsData}
      testSubmissions={testSubmissionsData}
    />
  );
}

