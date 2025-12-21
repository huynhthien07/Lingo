/**
 * API Route: Get Test Submissions by Attempt ID
 * GET /api/teacher/test-submissions/attempt/[attemptId]
 * 
 * Returns all speaking/writing submissions for a specific test attempt
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, tests, testQuestions, users, testAttempts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
  context: { params: Promise<{ attemptId: string }> }
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

    const { attemptId } = await context.params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    // Get attempt info
    const [attempt] = await db
      .select({
        attemptId: testAttempts.id,
        userId: testAttempts.userId,
        testId: testAttempts.testId,
        attemptStartedAt: testAttempts.startedAt,
        attemptCompletedAt: testAttempts.completedAt,
        testTitle: tests.title,
        testType: tests.testType,
        studentName: users.userName,
        studentEmail: users.email,
      })
      .from(testAttempts)
      .leftJoin(tests, eq(testAttempts.testId, tests.id))
      .leftJoin(users, eq(testAttempts.userId, users.userId))
      .where(eq(testAttempts.id, attemptIdNum))
      .limit(1);

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Get all submissions for this attempt
    const rawSubmissions = await db
      .select({
        // Submission fields
        id: testSubmissions.id,
        questionId: testSubmissions.questionId,
        skillType: testSubmissions.skillType,
        audioUrl: testSubmissions.audioUrl,
        textAnswer: testSubmissions.textAnswer,
        score: testSubmissions.score,
        maxScore: testSubmissions.maxScore,
        feedback: testSubmissions.feedback,
        status: testSubmissions.status,
        fluencyCoherenceScore: testSubmissions.fluencyCoherenceScore,
        pronunciationScore: testSubmissions.pronunciationScore,
        taskAchievementScore: testSubmissions.taskAchievementScore,
        coherenceCohesionScore: testSubmissions.coherenceCohesionScore,
        lexicalResourceScore: testSubmissions.lexicalResourceScore,
        grammaticalRangeScore: testSubmissions.grammaticalRangeScore,
        overallBandScore: testSubmissions.overallBandScore,
        // Question fields
        questionText: testQuestions.questionText,
      })
      .from(testSubmissions)
      .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
      .where(eq(testSubmissions.attemptId, attemptIdNum))
      .orderBy(testSubmissions.id);

    // Transform results (already flat from select)
    const submissions = rawSubmissions.map((row) => ({
      id: row.id,
      questionId: row.questionId,
      skillType: row.skillType,
      audioUrl: row.audioUrl,
      textAnswer: row.textAnswer,
      score: row.score,
      maxScore: row.maxScore,
      feedback: row.feedback,
      status: row.status,
      questionText: row.questionText,
      // Criteria scores
      fluencyCoherenceScore: row.fluencyCoherenceScore,
      pronunciationScore: row.pronunciationScore,
      taskAchievementScore: row.taskAchievementScore,
      coherenceCohesionScore: row.coherenceCohesionScore,
      lexicalResourceScore: row.lexicalResourceScore,
      grammaticalRangeScore: row.grammaticalRangeScore,
      overallBandScore: row.overallBandScore,
    }));

    const result = {
      ...attempt,
      submissions,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching attempt submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

