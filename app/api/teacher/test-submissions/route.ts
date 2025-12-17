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

    // Build query - using simpler approach to avoid Drizzle ORM issues
    const baseQuery = db
      .select()
      .from(testSubmissions)
      .leftJoin(tests, eq(testSubmissions.testId, tests.id))
      .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
      .leftJoin(users, eq(testSubmissions.userId, users.userId))
      .leftJoin(testAttempts, eq(testSubmissions.attemptId, testAttempts.id));

    // Apply filters
    const conditions = [];
    if (status) {
      conditions.push(eq(testSubmissions.status, status as any));
    }
    if (skillType) {
      conditions.push(eq(testSubmissions.skillType, skillType as any));
    }

    let query = baseQuery;
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Order by creation date (newest first)
    const rawResults = await query.orderBy(desc(testSubmissions.createdAt));

    // Transform results to flatten the joined data
    const submissions = rawResults.map((row: any) => ({
      id: row.test_submissions.id,
      attemptId: row.test_submissions.attemptId,
      userId: row.test_submissions.userId,
      testId: row.test_submissions.testId,
      questionId: row.test_submissions.questionId,
      skillType: row.test_submissions.skillType,
      audioUrl: row.test_submissions.audioUrl,
      textAnswer: row.test_submissions.textAnswer,
      score: row.test_submissions.score,
      maxScore: row.test_submissions.maxScore,
      feedback: row.test_submissions.feedback,
      status: row.test_submissions.status,
      gradedBy: row.test_submissions.gradedBy,
      gradedAt: row.test_submissions.gradedAt,
      createdAt: row.test_submissions.createdAt,
      // Join data
      testTitle: row.tests?.title,
      testType: row.tests?.testType,
      questionText: row.test_questions?.questionText,
      studentName: row.users?.name,
      studentEmail: row.users?.email,
      attemptStartedAt: row.test_attempts?.startedAt,
      attemptCompletedAt: row.test_attempts?.completedAt,
    }));

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

