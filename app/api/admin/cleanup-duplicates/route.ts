import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * POST /api/admin/cleanup-duplicates
 * Clean up duplicate test submissions - keep only GRADED version, remove PENDING duplicates
 */
export async function POST() {
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
        questionId: testSubmissions.questionId,
        userId: testSubmissions.userId,
        status: testSubmissions.status,
        createdAt: testSubmissions.createdAt,
        gradedAt: testSubmissions.gradedAt,
      })
      .from(testSubmissions)
      .orderBy(testSubmissions.createdAt);

    // Group by attemptId + questionId + userId
    const grouped = allSubmissions.reduce((acc: any, sub) => {
      const key = `${sub.userId}_${sub.attemptId}_${sub.questionId}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(sub);
      return acc;
    }, {});

    // Find duplicates and determine which to keep/delete
    const toDelete: number[] = [];
    const duplicateGroups: any[] = [];

    for (const [key, subs] of Object.entries(grouped) as [string, any][]) {
      if (subs.length > 1) {
        // Sort by priority: GRADED > RETURNED > GRADING > PENDING
        const statusPriority: Record<string, number> = {
          GRADED: 4,
          RETURNED: 3,
          GRADING: 2,
          PENDING: 1,
        };

        subs.sort((a: any, b: any) => {
          const aPriority = statusPriority[a.status] || 0;
          const bPriority = statusPriority[b.status] || 0;

          if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority first
          }

          // If same priority, sort by date (latest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Keep the first one (highest priority/latest), delete the rest
        const toKeep = subs[0];
        const toRemove = subs.slice(1);

        duplicateGroups.push({
          key,
          total: subs.length,
          keeping: {
            id: toKeep.id,
            status: toKeep.status,
            createdAt: toKeep.createdAt,
          },
          removing: toRemove.map((s: any) => ({
            id: s.id,
            status: s.status,
            createdAt: s.createdAt,
          })),
        });

        toDelete.push(...toRemove.map((s: any) => s.id));
      }
    }

    // Delete duplicates
    let deletedCount = 0;
    if (toDelete.length > 0) {
      const result = await db
        .delete(testSubmissions)
        .where(inArray(testSubmissions.id, toDelete));

      deletedCount = toDelete.length;
    }

    return NextResponse.json({
      success: true,
      totalSubmissions: allSubmissions.length,
      duplicateGroups: duplicateGroups.length,
      submissionsDeleted: deletedCount,
      details: duplicateGroups,
    });
  } catch (error) {
    console.error("Error cleaning up duplicates:", error);
    return NextResponse.json(
      { error: "Failed to clean up duplicates", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/cleanup-duplicates
 * Preview duplicates without deleting
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
        questionId: testSubmissions.questionId,
        userId: testSubmissions.userId,
        status: testSubmissions.status,
        createdAt: testSubmissions.createdAt,
        gradedAt: testSubmissions.gradedAt,
      })
      .from(testSubmissions)
      .orderBy(testSubmissions.createdAt);

    // Group by attemptId + questionId + userId
    const grouped = allSubmissions.reduce((acc: any, sub) => {
      const key = `${sub.userId}_${sub.attemptId}_${sub.questionId}`;
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

    return NextResponse.json({
      totalSubmissions: allSubmissions.length,
      duplicateGroups: duplicates.length,
      totalDuplicates: duplicates.reduce((sum, d) => sum + d.count - 1, 0),
      details: duplicates,
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    return NextResponse.json(
      { error: "Failed to check duplicates", details: String(error) },
      { status: 500 }
    );
  }
}

