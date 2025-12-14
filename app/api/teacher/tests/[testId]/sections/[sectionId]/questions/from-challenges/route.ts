import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import {
  challenges,
  questions,
  challengeOptions,
  testQuestions,
  testQuestionOptions,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ testId: string; sectionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionId } = await context.params;
    const body = await request.json();
    const { challengeIds } = body;

    if (!challengeIds || challengeIds.length === 0) {
      return NextResponse.json(
        { error: "No challenges selected" },
        { status: 400 }
      );
    }

    // Fetch challenges with their questions and options
    const selectedChallenges = await db
      .select()
      .from(challenges)
      .where(inArray(challenges.id, challengeIds));

    // Get current max order in section
    const existingQuestions = await db
      .select()
      .from(testQuestions)
      .where(eq(testQuestions.sectionId, parseInt(sectionId)));

    let currentOrder = existingQuestions.length;

    // Add each challenge as a test question
    for (const challenge of selectedChallenges) {
      currentOrder++;

      // Create test question from challenge
      const [newQuestion] = await db
        .insert(testQuestions)
        .values({
          sectionId: parseInt(sectionId),
          questionText: challenge.question,
          passage: challenge.passage,
          audioSrc: challenge.audioSrc,
          order: currentOrder,
          points: challenge.points,
        })
        .returning();

      // Check if challenge has sub-questions
      const subQuestions = await db
        .select()
        .from(questions)
        .where(eq(questions.challengeId, challenge.id))
        .orderBy(questions.order);

      if (subQuestions.length > 0) {
        // Challenge has sub-questions, copy them
        for (const subQuestion of subQuestions) {
          // Get options for this sub-question
          const subOptions = await db
            .select()
            .from(challengeOptions)
            .where(eq(challengeOptions.questionId, subQuestion.id))
            .orderBy(challengeOptions.order);

          // Create test question for sub-question
          const [newSubQuestion] = await db
            .insert(testQuestions)
            .values({
              sectionId: parseInt(sectionId),
              questionText: subQuestion.text,
              passage: null,
              audioSrc: null,
              order: ++currentOrder,
              points: 1,
            })
            .returning();

          // Copy options
          for (const option of subOptions) {
            await db.insert(testQuestionOptions).values({
              questionId: newSubQuestion.id,
              optionText: option.text,
              isCorrect: option.correct,
              order: option.order,
            });
          }
        }
      } else {
        // Challenge has direct options
        const options = await db
          .select()
          .from(challengeOptions)
          .where(eq(challengeOptions.challengeId, challenge.id))
          .orderBy(challengeOptions.order);

        // Copy options to test question
        for (const option of options) {
          await db.insert(testQuestionOptions).values({
            questionId: newQuestion.id,
            optionText: option.text,
            isCorrect: option.correct,
            order: option.order,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${challengeIds.length} exercise(s) to test section`,
    });
  } catch (error) {
    console.error("Error adding challenges to test:", error);
    return NextResponse.json(
      { error: "Failed to add challenges to test" },
      { status: 500 }
    );
  }
}

