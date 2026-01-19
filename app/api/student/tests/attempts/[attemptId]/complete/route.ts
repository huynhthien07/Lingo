/**
 * Complete Test Attempt API
 * POST /api/student/tests/attempts/[attemptId]/complete - Complete and grade test
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testSubmissions, testQuestions, tests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { calculateBandScore } from "@/lib/utils/band-score";

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

    // Get test info to check if it's an admission test
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, attempt.testId),
      with: {
        sections: {
          with: {
            questions: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Get answers with question and section info
    const answers = await db
      .select({
        answerId: testAnswers.id,
        questionId: testAnswers.questionId,
        pointsEarned: testAnswers.pointsEarned,
        questionPoints: testQuestions.points,
        sectionId: testQuestions.sectionId,
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

    // Calculate overall band score
    let bandScore = 0;
    let percentage = 0;

    if (totalPossiblePoints > 0) {
      percentage = (totalScore / totalPossiblePoints) * 100;
      bandScore = calculateBandScore(totalScore, totalPossiblePoints);
    }

    // For admission tests, calculate Reading and Listening band scores separately
    let readingBandScore: number | null = null;
    let listeningBandScore: number | null = null;

    if (test.isAdmission) {
      // Group answers by section skill type
      const sectionScores = new Map<number, { score: number; total: number; skillType: string }>();

      for (const answer of answers) {
        if (!answer.sectionId) continue;

        const section = test.sections.find((s) => s.id === answer.sectionId);
        if (!section) continue;

        const existing = sectionScores.get(answer.sectionId) || {
          score: 0,
          total: 0,
          skillType: section.skillType,
        };

        existing.score += answer.pointsEarned || 0;
        existing.total += answer.questionPoints || 0;
        sectionScores.set(answer.sectionId, existing);
      }

      // Calculate band scores for Reading and Listening sections
      let readingScore = 0;
      let readingTotal = 0;
      let listeningScore = 0;
      let listeningTotal = 0;

      for (const [_, sectionData] of sectionScores) {
        if (sectionData.skillType === "READING") {
          readingScore += sectionData.score;
          readingTotal += sectionData.total;
        } else if (sectionData.skillType === "LISTENING") {
          listeningScore += sectionData.score;
          listeningTotal += sectionData.total;
        }
      }

      if (readingTotal > 0) {
        readingBandScore = calculateBandScore(readingScore, readingTotal);
      }

      if (listeningTotal > 0) {
        listeningBandScore = calculateBandScore(listeningScore, listeningTotal);
      }
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
        readingBandScore,
        listeningBandScore,
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
      readingBandScore,
      listeningBandScore,
      isAdmission: test.isAdmission,
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

