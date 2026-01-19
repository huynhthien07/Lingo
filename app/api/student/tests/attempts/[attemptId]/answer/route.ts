/**
 * Submit Test Answer API
 * POST /api/student/tests/attempts/[attemptId]/answer - Submit answer for a question
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts, testAnswers, testQuestions, testQuestionOptions, testSubmissions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateAnswer } from "@/lib/utils/answer-validator";
import type { QuestionType } from "@/lib/utils/question-type-mapper";

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
    const { questionId, answerData, selectedOptionId, textAnswer } = body; // ✅ NEW: Accept answerData

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

    const questionSkillType = question.section?.skillType;
    const questionType = question.questionType as QuestionType | null; // ✅ NEW: Get question type

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

    // ✅ NEW: For other question types (LISTENING, READING, etc.), validate and save to testAnswers
    let isCorrect = false;
    let pointsEarned = 0;
    let finalAnswerData = answerData;

    // ⚠️ BACKWARD COMPATIBILITY: Convert old format to new format
    if (!answerData && (selectedOptionId || textAnswer)) {
      if (selectedOptionId) {
        finalAnswerData = { selectedOptionId };
      } else if (textAnswer) {
        finalAnswerData = { text: textAnswer };
      }
    }

    // ✅ NEW: Validate answer using new validation logic
    if (questionType && finalAnswerData) {
      let correctAnswer: any = null;
      let shouldValidate = true;

      // Get correct answer based on question type
      if (questionType === "SINGLE_CHOICE") {
        const correctOption = question.options.find(opt => opt.isCorrect);
        correctAnswer = correctOption?.id;
      } else if (questionType === "MULTIPLE_CHOICE") {
        correctAnswer = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
      } else if (questionType === "TEXT_INPUT") {
        // ✅ FIX: Get correctAnswer from question field
        correctAnswer = (question as any).correctAnswer || null;
        shouldValidate = correctAnswer !== null;
      } else if (questionType === "MATCHING" || questionType === "LABELING" || questionType === "ORDERING") {
        // These types use metadata for validation
        correctAnswer = null;
        shouldValidate = question.metadata !== null;
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
    } else {
      // ⚠️ FALLBACK: Old validation logic for backward compatibility
      if (selectedOptionId) {
        const selectedOption = question.options.find(
          (opt) => opt.id === selectedOptionId
        );
        if (selectedOption?.isCorrect) {
          isCorrect = true;
          pointsEarned = question.points || 1;
        }
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
          answerData: finalAnswerData, // ✅ NEW: Save as JSON
          selectedOptionId: selectedOptionId || null, // ⚠️ DEPRECATED: Keep for backward compatibility
          textAnswer: textAnswer || null, // ⚠️ DEPRECATED: Keep for backward compatibility
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
          answerData: finalAnswerData, // ✅ NEW: Save as JSON
          selectedOptionId: selectedOptionId || null, // ⚠️ DEPRECATED: Keep for backward compatibility
          textAnswer: textAnswer || null, // ⚠️ DEPRECATED: Keep for backward compatibility
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

