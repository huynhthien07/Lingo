/**
 * Teacher Option Management API Routes
 * PUT /api/teacher/questions/[questionId]/options/[optionId] - Update option
 * DELETE /api/teacher/questions/[questionId]/options/[optionId] - Delete option
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { challengeOptions, questions, teacherAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PUT /api/teacher/questions/[questionId]/options/[optionId]
 * Update an option
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string; optionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, optionId } = await params;
    const qId = parseInt(questionId);
    const oId = parseInt(optionId);

    if (isNaN(qId) || isNaN(oId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get option and verify access
    const option = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, oId),
      with: {
        question: {
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
        },
      },
    });

    if (!option || option.questionId !== qId) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    // Check teacher assignment
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, option.question.challenge.lesson.unit.courseId),
        eq(teacherAssignments.teacherId, userId)
      ),
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { text, correct, imageSrc, audioSrc } = body;

    // Update option
    const [updatedOption] = await db
      .update(challengeOptions)
      .set({
        text: text !== undefined ? text.trim() : option.text,
        correct: correct !== undefined ? correct : option.correct,
        imageSrc: imageSrc !== undefined ? imageSrc : option.imageSrc,
        audioSrc: audioSrc !== undefined ? audioSrc : option.audioSrc,
      })
      .where(eq(challengeOptions.id, oId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedOption,
    });
  } catch (error: any) {
    console.error("Error updating option:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update option" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/questions/[questionId]/options/[optionId]
 * Delete an option
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ questionId: string; optionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, optionId } = await params;
    const qId = parseInt(questionId);
    const oId = parseInt(optionId);

    if (isNaN(qId) || isNaN(oId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    // Get option and verify access
    const option = await db.query.challengeOptions.findFirst({
      where: eq(challengeOptions.id, oId),
      with: {
        question: {
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
        },
      },
    });

    if (!option || option.questionId !== qId) {
      return NextResponse.json({ error: "Option not found" }, { status: 404 });
    }

    // Check teacher assignment
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, option.question.challenge.lesson.unit.courseId),
        eq(teacherAssignments.teacherId, userId)
      ),
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete option
    await db.delete(challengeOptions).where(eq(challengeOptions.id, oId));

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting option:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete option" },
      { status: 500 }
    );
  }
}

