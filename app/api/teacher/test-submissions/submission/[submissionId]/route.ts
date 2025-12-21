import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, users, tests, testQuestions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/teacher/test-submissions/submission/[submissionId]
 * Get single test submission details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;
    const submissionIdNum = parseInt(submissionId);

    if (isNaN(submissionIdNum)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    // Get submission with related data
    const submission = await db.query.testSubmissions.findFirst({
      where: eq(testSubmissions.id, submissionIdNum),
      with: {
        user: {
          columns: {
            name: true,
            email: true,
          },
        },
        test: {
          columns: {
            title: true,
            type: true,
          },
        },
        question: {
          columns: {
            questionText: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Format response
    const response = {
      id: submission.id,
      attemptId: submission.attemptId,
      userId: submission.userId,
      testId: submission.testId,
      questionId: submission.questionId,
      audioUrl: submission.audioUrl,
      textAnswer: submission.textAnswer,
      fluencyCoherenceScore: submission.fluencyCoherenceScore,
      pronunciationScore: submission.pronunciationScore,
      taskAchievementScore: submission.taskAchievementScore,
      coherenceCohesionScore: submission.coherenceCohesionScore,
      lexicalResourceScore: submission.lexicalResourceScore,
      grammaticalRangeScore: submission.grammaticalRangeScore,
      overallBandScore: submission.overallBandScore,
      feedback: submission.feedback,
      status: submission.status,
      gradedBy: submission.gradedBy,
      gradedAt: submission.gradedAt,
      createdAt: submission.createdAt,
      student: submission.user,
      test: submission.test,
      question: submission.question,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching test submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch test submission" },
      { status: 500 }
    );
  }
}

