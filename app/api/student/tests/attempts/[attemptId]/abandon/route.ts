/**
 * POST /api/student/tests/attempts/[attemptId]/abandon
 * Abandon test attempt and delete all progress
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await context.params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    // Verify attempt belongs to user
    const attempt = await db.query.testAttempts.findFirst({
      where: and(
        eq(testAttempts.id, attemptIdNum),
        eq(testAttempts.userId, userId)
      ),
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Can only abandon in-progress tests" },
        { status: 400 }
      );
    }

    // Delete all answers for this attempt
    await db.delete(testAnswers).where(eq(testAnswers.attemptId, attemptIdNum));

    // Delete the attempt
    await db.delete(testAttempts).where(eq(testAttempts.id, attemptIdNum));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error abandoning test:", error);
    return NextResponse.json(
      { error: "Failed to abandon test" },
      { status: 500 }
    );
  }
}

