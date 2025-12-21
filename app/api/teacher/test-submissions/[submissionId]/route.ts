/**
 * API Route: Get/Update Test Submission
 * GET /api/teacher/test-submissions/[submissionId] - Get submission details
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, users, tests } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to check if user is teacher
async function getUserRole(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return user?.role;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is teacher or admin
    const role = await getUserRole(userId);
    if (role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { submissionId } = await context.params;
    const submissionIdNum = parseInt(submissionId);

    if (isNaN(submissionIdNum)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    // Get submission with related data
    const [result] = await db
      .select({
        id: testSubmissions.id,
        questionId: testSubmissions.questionId,
        skillType: testSubmissions.skillType,
        audioUrl: testSubmissions.audioUrl,
        textAnswer: testSubmissions.textAnswer,
        status: testSubmissions.status,
        fluencyCoherenceScore: testSubmissions.fluencyCoherenceScore,
        pronunciationScore: testSubmissions.pronunciationScore,
        taskAchievementScore: testSubmissions.taskAchievementScore,
        coherenceCohesionScore: testSubmissions.coherenceCohesionScore,
        lexicalResourceScore: testSubmissions.lexicalResourceScore,
        grammaticalRangeScore: testSubmissions.grammaticalRangeScore,
        overallBandScore: testSubmissions.overallBandScore,
        feedback: testSubmissions.feedback,
        createdAt: testSubmissions.createdAt,
        studentName: users.userName,
        studentEmail: users.email,
        testTitle: tests.title,
      })
      .from(testSubmissions)
      .leftJoin(users, eq(testSubmissions.userId, users.userId))
      .leftJoin(tests, eq(testSubmissions.testId, tests.id))
      .where(eq(testSubmissions.id, submissionIdNum))
      .limit(1);

    if (!result) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Get question text if available
    let questionText = null;
    if (result.questionId) {
      const questionResult = await db.query.testQuestions.findFirst({
        where: (questions, { eq }) => eq(questions.id, result.questionId!),
      });
      questionText = questionResult?.questionText || null;
    }

    return NextResponse.json({
      ...result,
      questionText,
    });
  } catch (error) {
    console.error("❌ Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}

