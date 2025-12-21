import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testSubmissions, testAnswers, testQuestions, tests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/debug/test-flow
 * Debug endpoint to check test submission flow
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all test attempts for this user
    const attempts = await db
      .select({
        id: testAttempts.id,
        testId: testAttempts.testId,
        userId: testAttempts.userId,
        status: testAttempts.status,
        startedAt: testAttempts.startedAt,
        completedAt: testAttempts.completedAt,
        testTitle: tests.title,
      })
      .from(testAttempts)
      .leftJoin(tests, eq(testAttempts.testId, tests.id))
      .where(eq(testAttempts.userId, userId))
      .orderBy(desc(testAttempts.startedAt));

    // For each attempt, get related data
    const attemptDetails = await Promise.all(
      attempts.map(async (attempt) => {
        // Get test submissions for this attempt
        const submissions = await db
          .select()
          .from(testSubmissions)
          .where(eq(testSubmissions.attemptId, attempt.id))
          .orderBy(desc(testSubmissions.createdAt));

        // Get test answers for this attempt
        const answers = await db
          .select()
          .from(testAnswers)
          .where(eq(testAnswers.attemptId, attempt.id));

        // Get test questions for this test
        const questions = await db
          .select({
            id: testQuestions.id,
            skillType: testQuestions.skillType,
            questionText: testQuestions.questionText,
          })
          .from(testQuestions)
          .where(eq(testQuestions.testId, attempt.testId));

        // Group submissions by questionId
        const submissionsByQuestion = submissions.reduce((acc: any, sub) => {
          const key = sub.questionId || 'null';
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push({
            id: sub.id,
            status: sub.status,
            skillType: sub.skillType,
            overallBandScore: sub.overallBandScore,
            createdAt: sub.createdAt,
            gradedAt: sub.gradedAt,
          });
          return acc;
        }, {});

        return {
          attempt: {
            id: attempt.id,
            testId: attempt.testId,
            testTitle: attempt.testTitle,
            status: attempt.status,
            startedAt: attempt.startedAt,
            completedAt: attempt.completedAt,
          },
          questions: {
            total: questions.length,
            bySkillType: questions.reduce((acc: any, q) => {
              acc[q.skillType] = (acc[q.skillType] || 0) + 1;
              return acc;
            }, {}),
          },
          submissions: {
            total: submissions.length,
            byStatus: submissions.reduce((acc: any, s) => {
              acc[s.status] = (acc[s.status] || 0) + 1;
              return acc;
            }, {}),
            byQuestion: submissionsByQuestion,
            duplicates: Object.entries(submissionsByQuestion)
              .filter(([_, subs]: [string, any]) => subs.length > 1)
              .map(([questionId, subs]) => ({
                questionId,
                count: subs.length,
                submissions: subs,
              })),
          },
          answers: {
            total: answers.length,
          },
        };
      })
    );

    return NextResponse.json({
      userId,
      totalAttempts: attempts.length,
      attempts: attemptDetails,
      summary: {
        totalSubmissions: attemptDetails.reduce((sum, a) => sum + a.submissions.total, 0),
        totalAnswers: attemptDetails.reduce((sum, a) => sum + a.answers.total, 0),
        duplicateCount: attemptDetails.reduce(
          (sum, a) => sum + a.submissions.duplicates.length,
          0
        ),
      },
    });
  } catch (error) {
    console.error("Error checking test flow:", error);
    return NextResponse.json(
      { error: "Failed to check test flow", details: String(error) },
      { status: 500 }
    );
  }
}

