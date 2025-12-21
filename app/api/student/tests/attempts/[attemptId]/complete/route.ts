/**
 * Complete Test Attempt API
 * POST /api/student/tests/attempts/[attemptId]/complete - Complete and grade test
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testSubmissions, testQuestions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/student/tests/attempts/[attemptId]/complete
 * Mark test as completed and calculate final score
 */
export async function POST(
  _req: NextRequest,
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

    // Verify attempt belongs to user (lightweight query)
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(and(
        eq(testAttempts.id, attemptIdNum),
        eq(testAttempts.userId, userId)
      ))
      .limit(1);

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // If already completed, return the existing result
    if (attempt.status === "COMPLETED") {
      // Quick count of pending submissions
      const pendingCount = await db
        .select({ count: testSubmissions.id })
        .from(testSubmissions)
        .where(eq(testSubmissions.attemptId, attemptIdNum));

      return NextResponse.json({
        attempt,
        totalScore: attempt.score || 0,
        totalPoints: attempt.totalPoints || 0,
        percentage: attempt.totalPoints ? Math.round(((attempt.score || 0) / attempt.totalPoints) * 100) : 0,
        bandScore: attempt.bandScore || 0,
        hasPendingSubmissions: pendingCount.length > 0,
        pendingSubmissionsCount: pendingCount.length,
        alreadyCompleted: true,
      });
    }

    // Get answers with question info (optimized query - only non-speaking/writing)
    const answers = await db
      .select({
        answerId: testAnswers.id,
        questionId: testAnswers.questionId,
        pointsEarned: testAnswers.pointsEarned,
        questionPoints: testQuestions.points,
      })
      .from(testAnswers)
      .leftJoin(testQuestions, eq(testAnswers.questionId, testQuestions.id))
      .where(eq(testAnswers.attemptId, attemptIdNum));

    // Calculate total score
    const totalScore = answers.reduce(
      (sum, answer) => sum + (answer.pointsEarned || 0),
      0
    );

    // Calculate total possible points
    const totalPossiblePoints = answers.reduce(
      (sum, answer) => sum + (answer.questionPoints || 0),
      0
    );

    // Calculate band score (simplified IELTS conversion)
    let bandScore = 0;
    let percentage = 0;

    if (totalPossiblePoints > 0) {
      percentage = (totalScore / totalPossiblePoints) * 100;
      if (percentage >= 90) bandScore = 9.0;
      else if (percentage >= 80) bandScore = 8.0;
      else if (percentage >= 70) bandScore = 7.0;
      else if (percentage >= 60) bandScore = 6.5;
      else if (percentage >= 50) bandScore = 6.0;
      else if (percentage >= 40) bandScore = 5.5;
      else if (percentage >= 30) bandScore = 5.0;
      else if (percentage >= 20) bandScore = 4.5;
      else bandScore = 4.0;
    }

    // Count pending submissions (speaking/writing already saved)
    const pendingSubmissions = await db
      .select({ id: testSubmissions.id })
      .from(testSubmissions)
      .where(and(
        eq(testSubmissions.attemptId, attemptIdNum),
        eq(testSubmissions.status, "PENDING")
      ));

    // Update attempt
    const [updatedAttempt] = await db
      .update(testAttempts)
      .set({
        status: "COMPLETED",
        score: totalScore,
        totalPoints: totalPossiblePoints,
        bandScore,
        completedAt: new Date(),
      })
      .where(eq(testAttempts.id, attemptIdNum))
      .returning();

    return NextResponse.json({
      attempt: updatedAttempt,
      totalScore,
      totalPoints: totalPossiblePoints,
      percentage: Math.round(percentage),
      bandScore,
      hasPendingSubmissions: pendingSubmissions.length > 0,
      pendingSubmissionsCount: pendingSubmissions.length,
    });
  } catch (error) {
    console.error("Error completing test:", error);
    return NextResponse.json(
      { error: "Failed to complete test" },
      { status: 500 }
    );
  }
}

