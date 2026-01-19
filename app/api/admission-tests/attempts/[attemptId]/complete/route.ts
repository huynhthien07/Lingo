/**
 * Complete Admission Test Attempt API
 * POST /api/admission-tests/attempts/[attemptId]/complete - Complete and grade test (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testQuestions, tests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { calculateBandScore } from "@/lib/utils/band-score";

/**
 * POST /api/admission-tests/attempts/[attemptId]/complete
 * Mark test as completed and calculate final score
 * No authentication required (for marketing page)
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await context.params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    // Get attempt (no userId check for admission tests)
    const attempt = await db.query.testAttempts.findFirst({
      where: eq(testAttempts.id, attemptIdNum),
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // If already completed, return the existing result
    if (attempt.status === "COMPLETED") {
      return NextResponse.json({
        attempt,
        totalScore: attempt.score || 0,
        totalPoints: attempt.totalPoints || 0,
        percentage: attempt.totalPoints ? Math.round(((attempt.score || 0) / attempt.totalPoints) * 100) : 0,
        bandScore: attempt.bandScore || 0,
        readingBandScore: attempt.readingBandScore,
        listeningBandScore: attempt.listeningBandScore,
        isAdmission: true,
        alreadyCompleted: true,
      });
    }

    // Get test info
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
      const readingAnswers = answers.filter((a) => {
        const question = test.sections
          .flatMap((s) => s.questions)
          .find((q) => q.id === a.questionId);
        return question && test.sections.find((s) => s.id === a.sectionId)?.skillType === "READING";
      });

      const listeningAnswers = answers.filter((a) => {
        const question = test.sections
          .flatMap((s) => s.questions)
          .find((q) => q.id === a.questionId);
        return question && test.sections.find((s) => s.id === a.sectionId)?.skillType === "LISTENING";
      });

      const readingScore = readingAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const readingTotal = readingAnswers.reduce((sum, a) => sum + (a.questionPoints || 0), 0);
      const listeningScore = listeningAnswers.reduce((sum, a) => sum + (a.pointsEarned || 0), 0);
      const listeningTotal = listeningAnswers.reduce((sum, a) => sum + (a.questionPoints || 0), 0);

      if (readingTotal > 0) readingBandScore = calculateBandScore(readingScore, readingTotal);
      if (listeningTotal > 0) listeningBandScore = calculateBandScore(listeningScore, listeningTotal);
    }

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
      isAdmission: true,
    });
  } catch (error) {
    console.error("Error completing admission test:", error);
    return NextResponse.json(
      { error: "Failed to complete test" },
      { status: 500 }
    );
  }
}

