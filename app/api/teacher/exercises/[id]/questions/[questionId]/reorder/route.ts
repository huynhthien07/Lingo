/**
 * Teacher Question Reorder API Route
 * PUT /api/teacher/exercises/[id]/questions/[questionId]/reorder - Reorder question
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questions, teacherAssignments } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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
    const { newOrder } = body;

    if (typeof newOrder !== "number") {
      return NextResponse.json({ error: "New order is required" }, { status: 400 });
    }

    // Update question order
    await db
      .update(questions)
      .set({ order: newOrder, updatedAt: new Date() })
      .where(eq(questions.id, qId));

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error reordering question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reorder question" },
      { status: 500 }
    );
  }
}

