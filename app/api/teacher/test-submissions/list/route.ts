import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, users, tests, testQuestions, testAttempts } from "@/db/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";

/**
 * GET /api/teacher/test-submissions/list
 * Get paginated list of test submissions filtered by skill type
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skillType = searchParams.get("skillType") as "SPEAKING" | "WRITING" | null;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (skillType) {
      conditions.push(eq(testSubmissions.skillType, skillType));
    }

    if (status) {
      conditions.push(eq(testSubmissions.status, status as any));
    }

    if (search) {
      conditions.push(
        or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`),
          like(tests.title, `%${search}%`)
        )
      );
    }

    // Get submissions with student and test info
    const submissions = await db
      .select({
        id: testSubmissions.id,
        attemptId: testSubmissions.attemptId,
        userId: testSubmissions.userId,
        testId: testSubmissions.testId,
        questionId: testSubmissions.questionId,
        skillType: testSubmissions.skillType,
        audioUrl: testSubmissions.audioUrl,
        textAnswer: testSubmissions.textAnswer,
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
        testTitle: tests.title,
        testType: tests.type,
        questionText: testQuestions.questionText,
        studentName: users.userName,
        studentEmail: users.email,
      })
      .from(testSubmissions)
      .leftJoin(users, eq(testSubmissions.userId, users.userId))
      .leftJoin(tests, eq(testSubmissions.testId, tests.id))
      .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(testSubmissions.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testSubmissions)
      .leftJoin(users, eq(testSubmissions.userId, users.userId))
      .leftJoin(tests, eq(testSubmissions.testId, tests.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      submissions,
      total: Number(count),
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching test submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch test submissions" },
      { status: 500 }
    );
  }
}

