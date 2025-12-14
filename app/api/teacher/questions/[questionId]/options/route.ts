/**
 * Teacher Question Options API Routes
 * POST /api/teacher/questions/[questionId]/options - Create option
 * GET /api/teacher/questions/[questionId]/options - Get all options for question
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { challengeOptions, questions, teacherAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/teacher/questions/[questionId]/options
 * Create a new option for a question
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const qId = parseInt(questionId);

    if (isNaN(qId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    // Get question and verify access
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, qId),
      with: {
        challenge: {
          with: {
            lesson: {
              with: {
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check teacher assignment
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, question.challenge.lesson.unit.courseId),
        eq(teacherAssignments.teacherId, userId)
      ),
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { text, correct, imageSrc, audioSrc, order } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Option text is required" }, { status: 400 });
    }

    // Create option
    const [newOption] = await db
      .insert(challengeOptions)
      .values({
        questionId: qId,
        challengeId: question.challengeId,
        text: text.trim(),
        correct: correct || false,
        imageSrc: imageSrc || null,
        audioSrc: audioSrc || null,
        order: order || 1,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newOption,
    });
  } catch (error: any) {
    console.error("Error creating option:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create option" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teacher/questions/[questionId]/options
 * Get all options for a question
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;
    const qId = parseInt(questionId);

    if (isNaN(qId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    // Get question and verify access
    const question = await db.query.questions.findFirst({
      where: eq(questions.id, qId),
      with: {
        challenge: {
          with: {
            lesson: {
              with: {
                unit: true,
              },
            },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Check teacher assignment
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, question.challenge.lesson.unit.courseId),
        eq(teacherAssignments.teacherId, userId)
      ),
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all options
    const options = await db.query.challengeOptions.findMany({
      where: eq(challengeOptions.questionId, qId),
      orderBy: (challengeOptions, { asc }) => [asc(challengeOptions.order)],
    });

    return NextResponse.json({
      success: true,
      data: options,
    });
  } catch (error: any) {
    console.error("Error fetching options:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch options" },
      { status: 500 }
    );
  }
}

