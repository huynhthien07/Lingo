/**
 * API Route: Submit Speaking/Writing Test
 * POST /api/student/tests/attempts/[attemptId]/submit-speaking-writing
 * 
 * Creates a submission for speaking or writing test questions that require teacher grading
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, testAttempts, tests, testQuestions } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { questionId, skillType, audioUrl, textAnswer } = body;

    // Validate required fields
    if (!questionId || !skillType) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, skillType" },
        { status: 400 }
      );
    }

    if (skillType !== "SPEAKING" && skillType !== "WRITING") {
      return NextResponse.json(
        { error: "Invalid skillType. Must be SPEAKING or WRITING" },
        { status: 400 }
      );
    }

    if (skillType === "SPEAKING" && !audioUrl) {
      return NextResponse.json(
        { error: "audioUrl is required for SPEAKING submissions" },
        { status: 400 }
      );
    }

    if (skillType === "WRITING" && !textAnswer) {
      return NextResponse.json(
        { error: "textAnswer is required for WRITING submissions" },
        { status: 400 }
      );
    }

    // Verify attempt exists and belongs to user
    const [attempt] = await db
      .select()
      .from(testAttempts)
      .where(
        and(
          eq(testAttempts.id, attemptIdNum),
          eq(testAttempts.userId, userId)
        )
      )
      .limit(1);

    if (!attempt) {
      return NextResponse.json(
        { error: "Test attempt not found" },
        { status: 404 }
      );
    }

    // Check if submission already exists for this question
    const [existingSubmission] = await db
      .select()
      .from(testSubmissions)
      .where(
        and(
          eq(testSubmissions.attemptId, attemptIdNum),
          eq(testSubmissions.questionId, questionId)
        )
      )
      .limit(1);

    if (existingSubmission) {
      // Update existing submission
      const [updated] = await db
        .update(testSubmissions)
        .set({
          audioUrl: skillType === "SPEAKING" ? audioUrl : null,
          textAnswer: skillType === "WRITING" ? textAnswer : null,
          status: "PENDING",
          createdAt: new Date(),
        })
        .where(eq(testSubmissions.id, existingSubmission.id))
        .returning();

      return NextResponse.json(updated, { status: 200 });
    }

    // Create new submission
    const [submission] = await db
      .insert(testSubmissions)
      .values({
        attemptId: attemptIdNum,
        userId,
        testId: attempt.testId,
        questionId,
        skillType,
        audioUrl: skillType === "SPEAKING" ? audioUrl : null,
        textAnswer: skillType === "WRITING" ? textAnswer : null,
        status: "PENDING",
      })
      .returning();

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("❌ Error submitting speaking/writing:", error);
    return NextResponse.json(
      { error: "Failed to submit" },
      { status: 500 }
    );
  }
}

