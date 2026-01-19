/**
 * Submit Admission Test Answer API
 * POST /api/admission-tests/attempts/[attemptId]/answer - Submit answer (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testQuestions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateAnswer } from "@/lib/utils/answer-validator";
import type { QuestionType } from "@/lib/utils/question-type-mapper";

/**
 * POST /api/admission-tests/attempts/[attemptId]/answer
 * Submit or update answer for a question
 * No authentication required (for marketing page)
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await context.params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    const body = await req.json();
    const { questionId, answerData, selectedOptionId, textAnswer } = body;

    // Verify attempt exists and is in progress (no userId check for admission tests)
    const attempt = await db.query.testAttempts.findFirst({
      where: eq(testAttempts.id, attemptIdNum),
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

    // Get question to determine question type and validate answer
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

    const questionType = question.questionType as QuestionType | null;

    // Prepare answer data
    let finalAnswerData = answerData;
    if (!answerData && (selectedOptionId || textAnswer)) {
      if (selectedOptionId) {
        finalAnswerData = { selectedOptionId };
      } else if (textAnswer) {
        finalAnswerData = { text: textAnswer };
      }
    }

    // Validate answer
    let isCorrect = false;
    let pointsEarned = 0;

    if (questionType && finalAnswerData) {
      let correctAnswer: any = null;
      let shouldValidate = true;

      // Get correct answer based on question type
      if (questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE") {
        const correctOptions = question.options.filter((opt) => opt.isCorrect);
        correctAnswer = questionType === "SINGLE_CHOICE"
          ? correctOptions[0]?.id
          : correctOptions.map((opt) => opt.id);
      } else if (questionType === "TEXT_INPUT") {
        const correctOption = question.options.find((opt) => opt.isCorrect);
        correctAnswer = correctOption?.optionText || null;
      }

      // Validate if we have the necessary data
      if (shouldValidate) {
        const validation = validateAnswer(
          questionType,
          finalAnswerData,
          correctAnswer,
          question.metadata,
          question.points || 1
        );

        isCorrect = validation.isCorrect;
        pointsEarned = validation.pointsEarned;
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
          answerData: finalAnswerData,
          selectedOptionId: selectedOptionId || null,
          textAnswer: textAnswer || null,
          isCorrect,
          pointsEarned,
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
          answerData: finalAnswerData,
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

