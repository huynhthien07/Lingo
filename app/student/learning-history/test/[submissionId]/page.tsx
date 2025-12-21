import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { testSubmissions, tests, testQuestions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import TestSubmissionDetail from "@/components/student/test-submission-detail";

export default async function TestSubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { submissionId } = await params;
  const submissionIdNum = parseInt(submissionId);

  if (isNaN(submissionIdNum)) {
    redirect("/student/learning-history");
  }

  // Fetch submission with test and question details
  const [submission] = await db
    .select({
      id: testSubmissions.id,
      attemptId: testSubmissions.attemptId,
      testId: testSubmissions.testId,
      questionId: testSubmissions.questionId,
      skillType: testSubmissions.skillType,
      audioUrl: testSubmissions.audioUrl,
      textAnswer: testSubmissions.textAnswer,
      // Criteria scores
      fluencyCoherenceScore: testSubmissions.fluencyCoherenceScore,
      pronunciationScore: testSubmissions.pronunciationScore,
      taskAchievementScore: testSubmissions.taskAchievementScore,
      coherenceCohesionScore: testSubmissions.coherenceCohesionScore,
      lexicalResourceScore: testSubmissions.lexicalResourceScore,
      grammaticalRangeScore: testSubmissions.grammaticalRangeScore,
      overallBandScore: testSubmissions.overallBandScore,
      feedback: testSubmissions.feedback,
      status: testSubmissions.status,
      gradedAt: testSubmissions.gradedAt,
      createdAt: testSubmissions.createdAt,
      testTitle: tests.title,
      questionText: testQuestions.questionText,
    })
    .from(testSubmissions)
    .leftJoin(tests, eq(testSubmissions.testId, tests.id))
    .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
    .where(
      and(
        eq(testSubmissions.id, submissionIdNum),
        eq(testSubmissions.userId, userId)
      )
    );

  if (!submission) {
    redirect("/student/learning-history");
  }

  return <TestSubmissionDetail submission={submission} />;
}

