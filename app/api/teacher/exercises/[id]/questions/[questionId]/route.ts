/**
 * Teacher Question Management API Routes
 * PUT /api/teacher/exercises/[id]/questions/[questionId] - Update question
 * DELETE /api/teacher/exercises/[id]/questions/[questionId] - Delete question
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questions, teacherAssignments, challenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * PUT /api/teacher/exercises/[id]/questions/[questionId]
 * Update a question
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, questionId } = await params;
    const exerciseId = parseInt(id);
    const qId = parseInt(questionId);

    if (isNaN(exerciseId) || isNaN(qId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
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

    if (!question || question.challengeId !== exerciseId) {
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
    const { text } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    // Update question
    const [updatedQuestion] = await db
      .update(questions)
      .set({
        text: text.trim(),
        updatedAt: new Date(),
      })
      .where(eq(questions.id, qId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedQuestion,
    });
  } catch (error: any) {
    console.error("Error updating question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update question" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/exercises/[id]/questions/[questionId]
 * Delete a question
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, questionId } = await params;
    const exerciseId = parseInt(id);
    const qId = parseInt(questionId);

    if (isNaN(exerciseId) || isNaN(qId)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
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

    if (!question || question.challengeId !== exerciseId) {
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

    // Delete question (cascade will delete options)
    await db.delete(questions).where(eq(questions.id, qId));

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete question" },
      { status: 500 }
    );
  }
}

