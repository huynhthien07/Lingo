/**
 * Complete Test Attempt API
 * POST /api/student/tests/attempts/[attemptId]/complete - Complete and grade test
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testSubmissions, testQuestions, testSections } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

/**
 * POST /api/student/tests/attempts/[attemptId]/complete
 * Mark test as completed and calculate final score
 */
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
      with: {
        answers: {
          with: {
            question: {
              with: {
                section: true,
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // If already completed, return the existing result instead of error
    if (attempt.status === "COMPLETED") {
      // Count speaking/writing answers
      const speakingWritingCount = attempt.answers.filter(
        (answer) =>
          answer.question?.section?.skillType === "SPEAKING" ||
          answer.question?.section?.skillType === "WRITING"
      ).length;

      return NextResponse.json({
        attempt,
        totalScore: attempt.score || 0,
        totalPoints: attempt.totalPoints || 0,
        percentage: attempt.totalPoints ? Math.round(((attempt.score || 0) / attempt.totalPoints) * 100) : 0,
        bandScore: attempt.bandScore || 0,
        hasPendingSubmissions: speakingWritingCount > 0,
        pendingSubmissionsCount: speakingWritingCount,
        alreadyCompleted: true,
      });
    }

    // Separate speaking/writing from other questions
    const speakingWritingAnswers = attempt.answers.filter(
      (answer) =>
        answer.question?.section?.skillType === "SPEAKING" ||
        answer.question?.section?.skillType === "WRITING"
    );

    const otherAnswers = attempt.answers.filter(
      (answer) =>
        answer.question?.section?.skillType !== "SPEAKING" &&
        answer.question?.section?.skillType !== "WRITING"
    );

    // Calculate total score (only for non-speaking/writing questions)
    const totalScore = otherAnswers.reduce(
      (sum, answer) => sum + (answer.pointsEarned || 0),
      0
    );

    // Calculate total possible points (only for non-speaking/writing questions)
    const totalPossiblePoints = otherAnswers.reduce(
      (sum, answer) => sum + (answer.question?.points || 0),
      0
    );

    // Calculate band score (simplified IELTS conversion)
    // Only calculate if there are gradable questions
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

    // Create submissions for speaking/writing questions
    if (speakingWritingAnswers.length > 0) {
      for (const answer of speakingWritingAnswers) {
        if (!answer.question || !answer.question.section) continue;

        const skillType = answer.question.section.skillType;
        if (skillType !== "SPEAKING" && skillType !== "WRITING") continue;

        // Check if submission already exists
        const [existingSubmission] = await db
          .select()
          .from(testSubmissions)
          .where(
            and(
              eq(testSubmissions.attemptId, attemptIdNum),
              eq(testSubmissions.questionId, answer.questionId)
            )
          )
          .limit(1);

        if (!existingSubmission && answer.textAnswer) {
          // Create new submission
          await db.insert(testSubmissions).values({
            attemptId: attemptIdNum,
            userId,
            testId: attempt.testId,
            questionId: answer.questionId,
            skillType,
            audioUrl: skillType === "SPEAKING" ? answer.textAnswer : null,
            textAnswer: skillType === "WRITING" ? answer.textAnswer : null,
            status: "PENDING",
          });
        }
      }
    }

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
      hasPendingSubmissions: speakingWritingAnswers.length > 0,
      pendingSubmissionsCount: speakingWritingAnswers.length,
    });
  } catch (error) {
    console.error("Error completing test:", error);
    return NextResponse.json(
      { error: "Failed to complete test" },
      { status: 500 }
    );
  }
}

