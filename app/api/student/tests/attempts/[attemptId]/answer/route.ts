/**
 * Submit Test Answer API
 * POST /api/student/tests/attempts/[attemptId]/answer - Submit answer for a question
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testQuestions, testQuestionOptions, testSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/student/tests/attempts/[attemptId]/answer
 * Submit or update answer for a question
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

    const body = await req.json();
    const { questionId, selectedOptionId, textAnswer, skillType } = body;

    // Verify attempt belongs to user and is in progress
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
        { error: "Cannot modify completed test" },
        { status: 400 }
      );
    }

    // Get question to determine skill type and if answer is correct
    const question = await db.query.testQuestions.findFirst({
      where: eq(testQuestions.id, questionId),
      with: {
        options: true,
        section: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const questionSkillType = question.section?.skillType;

    // For SPEAKING/WRITING, save to testSubmissions instead of testAnswers
    if (questionSkillType === "SPEAKING" || questionSkillType === "WRITING") {
      // Check if submission already exists
      const existingSubmission = await db.query.testSubmissions.findFirst({
        where: and(
          eq(testSubmissions.attemptId, attemptIdNum),
          eq(testSubmissions.questionId, questionId)
        ),
      });

      let submission;

      if (existingSubmission) {
        // Update existing submission
        [submission] = await db
          .update(testSubmissions)
          .set({
            audioUrl: questionSkillType === "SPEAKING" ? textAnswer : null,
            textAnswer: questionSkillType === "WRITING" ? textAnswer : null,
            status: "PENDING",
          })
          .where(eq(testSubmissions.id, existingSubmission.id))
          .returning();
      } else {
        // Create new submission
        [submission] = await db
          .insert(testSubmissions)
          .values({
            attemptId: attemptIdNum,
            userId,
            testId: attempt.testId,
            questionId,
            skillType: questionSkillType,
            audioUrl: questionSkillType === "SPEAKING" ? textAnswer : null,
            textAnswer: questionSkillType === "WRITING" ? textAnswer : null,
            status: "PENDING",
          })
          .returning();
      }

      return NextResponse.json(submission);
    }

    // For other question types (LISTENING, READING, etc.), save to testAnswers
    let isCorrect = false;
    let pointsEarned = 0;

    // Check if answer is correct
    if (selectedOptionId) {
      const selectedOption = question.options.find(
        (opt) => opt.id === selectedOptionId
      );
      if (selectedOption?.isCorrect) {
        isCorrect = true;
        pointsEarned = question.points || 1;
      }
    }

    // Check if answer already exists
    const existingAnswer = await db.query.testAnswers.findFirst({
      where: and(
        eq(testAnswers.attemptId, attemptIdNum),
        eq(testAnswers.questionId, questionId)
      ),
    });

    let answer;

    if (existingAnswer) {
      // Update existing answer
      [answer] = await db
        .update(testAnswers)
        .set({
          selectedOptionId: selectedOptionId || null,
          textAnswer: textAnswer || null,
          isCorrect,
          pointsEarned,
          answeredAt: new Date(),
        })
        .where(eq(testAnswers.id, existingAnswer.id))
        .returning();
    } else {
      // Create new answer
      [answer] = await db
        .insert(testAnswers)
        .values({
          attemptId: attemptIdNum,
          questionId,
          selectedOptionId: selectedOptionId || null,
          textAnswer: textAnswer || null,
          isCorrect,
          pointsEarned,
        })
        .returning();
    }

    return NextResponse.json(answer);
  } catch (error) {
    console.error("Error submitting answer:", error);
    return NextResponse.json(
      { error: "Failed to submit answer" },
      { status: 500 }
    );
  }
}

