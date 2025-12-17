/**
 * API Route: Get Student's Test Submissions
 * GET /api/student/test-submissions
 * 
 * Returns graded speaking/writing test submissions for the student
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, tests, testQuestions, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "GRADED";
    const skillType = searchParams.get("skillType");

    // Build query
    let query = db
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
        gradedBy: testSubmissions.gradedBy,
        gradedAt: testSubmissions.gradedAt,
        createdAt: testSubmissions.createdAt,
        // Join data
        testTitle: tests.title,
        testType: tests.testType,
        questionText: testQuestions.questionText,
        graderName: users.name,
      })
      .from(testSubmissions)
      .leftJoin(tests, eq(testSubmissions.testId, tests.id))
      .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
      .leftJoin(users, eq(testSubmissions.gradedBy, users.userId))
      .where(eq(testSubmissions.userId, userId));

    // Apply filters
    const conditions = [eq(testSubmissions.userId, userId)];
    if (status) {
      conditions.push(eq(testSubmissions.status, status as any));
    }
    if (skillType) {
      conditions.push(eq(testSubmissions.skillType, skillType as any));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    // Order by graded date (newest first)
    const submissions = await query.orderBy(desc(testSubmissions.gradedAt));

    return NextResponse.json(submissions, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching student submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

