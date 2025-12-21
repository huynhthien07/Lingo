/**
 * API Route: Get Test Submissions for Grading
 * GET /api/teacher/test-submissions
 * 
 * Returns list of speaking/writing test submissions for teacher to grade
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, tests, testQuestions, users, testAttempts } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

// Helper function to check if user is teacher
async function getUserRole(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return user?.role;
}

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    const skillType = searchParams.get("skillType");

    // Build query - get submissions first, then join data separately to avoid Drizzle ORM issues
    const conditions = [];
    if (status) {
      conditions.push(eq(testSubmissions.status, status as any));
    }
    if (skillType) {
      conditions.push(eq(testSubmissions.skillType, skillType as any));
    }

    let baseSubmissions = db
      .select({
        id: testSubmissions.id,
        attemptId: testSubmissions.attemptId,
        userId: testSubmissions.userId,
        testId: testSubmissions.testId,
        questionId: testSubmissions.questionId,
        skillType: testSubmissions.skillType,
        audioUrl: testSubmissions.audioUrl,
        textAnswer: testSubmissions.textAnswer,
        score: testSubmissions.score,
        maxScore: testSubmissions.maxScore,
        fluencyCoherenceScore: testSubmissions.fluencyCoherenceScore,
        pronunciationScore: testSubmissions.pronunciationScore,
        taskAchievementScore: testSubmissions.taskAchievementScore,
        coherenceCohesionScore: testSubmissions.coherenceCohesionScore,
        lexicalResourceScore: testSubmissions.lexicalResourceScore,
        grammaticalRangeScore: testSubmissions.grammaticalRangeScore,
        overallBandScore: testSubmissions.overallBandScore,
        feedback: testSubmissions.feedback,
        status: testSubmissions.status,
        gradedBy: testSubmissions.gradedBy,
        gradedAt: testSubmissions.gradedAt,
        createdAt: testSubmissions.createdAt,
      })
      .from(testSubmissions)
      .orderBy(desc(testSubmissions.createdAt));

    if (conditions.length > 0) {
      baseSubmissions = baseSubmissions.where(and(...conditions)) as any;
    }

    const rawSubmissions = await baseSubmissions;

    // Enrich submissions with related data
    const submissions = await Promise.all(
      rawSubmissions.map(async (submission: any) => {
        // Get test info
        const testResults = await db
          .select({ title: tests.title, testType: tests.testType })
          .from(tests)
          .where(eq(tests.id, submission.testId))
          .limit(1);
        const test = testResults[0] || null;

        // Get student info
        const [student] = await db
          .select({ name: users.userName, email: users.email })
          .from(users)
          .where(eq(users.userId, submission.userId))
          .limit(1);

        // Get attempt info
        const [attempt] = await db
          .select({ startedAt: testAttempts.startedAt, completedAt: testAttempts.completedAt })
          .from(testAttempts)
          .where(eq(testAttempts.id, submission.attemptId))
          .limit(1);

        // Get question text if available
        let questionText = null;
        if (submission.questionId) {
          const [question] = await db
            .select({ questionText: testQuestions.questionText })
            .from(testQuestions)
            .where(eq(testQuestions.id, submission.questionId))
            .limit(1);
          questionText = question?.questionText || null;
        }

        return {
          ...submission,
          testTitle: test?.title || null,
          testType: test?.testType || null,
          studentName: student?.name || null,
          studentEmail: student?.email || null,
          attemptStartedAt: attempt?.startedAt || null,
          attemptCompletedAt: attempt?.completedAt || null,
          questionText,
        };
      })
    );

    console.log("✅ Fetched submissions:", submissions.length);

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching test submissions:", error);
    console.error("❌ Error stack:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

