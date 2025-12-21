import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, users } from "@/db/schema";
import { desc } from "drizzle-orm";

/**
 * GET /api/debug/teacher-submissions
 * Debug endpoint to check all test submissions visible to teacher
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all test submissions
    const allSubmissions = await db
      .select({
        id: testSubmissions.id,
        attemptId: testSubmissions.attemptId,
        testId: testSubmissions.testId,
        questionId: testSubmissions.questionId,
        userId: testSubmissions.userId,
        studentName: users.userName,
        skillType: testSubmissions.skillType,
        status: testSubmissions.status,
        overallBandScore: testSubmissions.overallBandScore,
        createdAt: testSubmissions.createdAt,
        gradedAt: testSubmissions.gradedAt,
      })
      .from(testSubmissions)
      .leftJoin(users, testSubmissions.userId === users.userId)
      .orderBy(desc(testSubmissions.createdAt));

    // Group by attemptId + questionId to find duplicates
    const grouped = allSubmissions.reduce((acc: any, sub) => {
      const key = `${sub.attemptId}_${sub.questionId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(sub);
      return acc;
    }, {});

    const duplicates = Object.entries(grouped)
      .filter(([_, subs]: [string, any]) => subs.length > 1)
      .map(([key, subs]: [string, any]) => ({
        key,
        count: subs.length,
        submissions: subs,
      }));

    // Group by status
    const byStatus = allSubmissions.reduce((acc: any, sub) => {
      if (!acc[sub.status]) {
        acc[sub.status] = [];
      }
      acc[sub.status].push(sub);
      return acc;
    }, {});

    return NextResponse.json({
      total: allSubmissions.length,
      byStatus: Object.entries(byStatus).map(([status, subs]: [string, any]) => ({
        status,
        count: subs.length,
      })),
      duplicates: {
        count: duplicates.length,
        details: duplicates,
      },
      allSubmissions: allSubmissions.map((s) => ({
        id: s.id,
        attemptId: s.attemptId,
        questionId: s.questionId,
        userId: s.userId,
        studentName: s.studentName,
        skillType: s.skillType,
        status: s.status,
        overallBandScore: s.overallBandScore,
        createdAt: s.createdAt,
        gradedAt: s.gradedAt,
      })),
    });
  } catch (error) {
    console.error("Error checking teacher submissions:", error);
    return NextResponse.json(
      { error: "Failed to check submissions", details: String(error) },
      { status: 500 }
    );
  }
}

