import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/debug/check-duplicates
 * Check for duplicate test submissions
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all test submissions
    const allSubmissions = await db.select().from(testSubmissions);

    // Group by attemptId + questionId to find duplicates
    const grouped = allSubmissions.reduce((acc: any, sub) => {
      const key = `${sub.attemptId}_${sub.questionId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(sub);
      return acc;
    }, {});

    // Find duplicates
    const duplicates = Object.entries(grouped)
      .filter(([_, subs]: [string, any]) => subs.length > 1)
      .map(([key, subs]: [string, any]) => ({
        key,
        count: subs.length,
        submissions: subs,
      }));

    // Get submissions by status
    const byStatus = allSubmissions.reduce((acc: any, sub) => {
      if (!acc[sub.status]) {
        acc[sub.status] = [];
      }
      acc[sub.status].push(sub);
      return acc;
    }, {});

    return NextResponse.json({
      total: allSubmissions.length,
      duplicates: duplicates.length,
      duplicateDetails: duplicates,
      byStatus: Object.entries(byStatus).map(([status, subs]: [string, any]) => ({
        status,
        count: subs.length,
      })),
      allSubmissions: allSubmissions.map((s) => ({
        id: s.id,
        attemptId: s.attemptId,
        questionId: s.questionId,
        skillType: s.skillType,
        status: s.status,
        overallBandScore: s.overallBandScore,
        createdAt: s.createdAt,
        gradedAt: s.gradedAt,
      })),
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return NextResponse.json(
      { error: "Failed to check duplicates", details: String(error) },
      { status: 500 }
    );
  }
}

