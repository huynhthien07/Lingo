/**
 * Teacher Exercise Questions API Routes
 * POST /api/teacher/exercises/[id]/questions - Create question
 * GET /api/teacher/exercises/[id]/questions - Get all questions for exercise
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questions, teacherAssignments, challenges } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/teacher/exercises/[id]/questions
 * Create a new question for an exercise
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    // Get exercise and verify teacher access
    const exercise = await db.query.challenges.findFirst({
      where: eq(challenges.id, exerciseId),
      with: {
        lesson: {
          with: {
            unit: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Check teacher assignment
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, exercise.lesson.unit.courseId),
        eq(teacherAssignments.teacherId, userId)
      ),
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { text, imageSrc, correctAnswer, explanation } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 });
    }

    // Get current max order
    const existingQuestions = await db.query.questions.findMany({
      where: eq(questions.challengeId, exerciseId),
    });

    const maxOrder = existingQuestions.length > 0
      ? Math.max(...existingQuestions.map((q) => q.order))
      : 0;

    // Create question
    const [newQuestion] = await db
      .insert(questions)
      .values({
        challengeId: exerciseId,
        text: text.trim(),
        imageSrc: imageSrc || null,
        correctAnswer: correctAnswer?.trim() || null,
        explanation: explanation?.trim() || null,
        order: maxOrder + 1,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newQuestion,
    });
  } catch (error: any) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create question" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teacher/exercises/[id]/questions
 * Get all questions for an exercise
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    // Get exercise and verify teacher access
    const exercise = await db.query.challenges.findFirst({
      where: eq(challenges.id, exerciseId),
      with: {
        lesson: {
          with: {
            unit: true,
          },
        },
      },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    // Check teacher assignment
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, exercise.lesson.unit.courseId),
        eq(teacherAssignments.teacherId, userId)
      ),
    });

    if (!assignment) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get all questions with options
    const allQuestions = await db.query.questions.findMany({
      where: eq(questions.challengeId, exerciseId),
      with: {
        options: true,
      },
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });

    return NextResponse.json({
      success: true,
      data: allQuestions,
    });
  } catch (error: any) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

