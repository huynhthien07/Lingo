/**
 * Teacher Exercise Management API Routes - Single Exercise
 * GET /api/teacher/exercises/[id] - Get exercise by ID
 * PUT /api/teacher/exercises/[id] - Update exercise
 * DELETE /api/teacher/exercises/[id] - Delete exercise
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherExerciseById,
  updateTeacherExercise,
  deleteTeacherExercise,
} from "@/lib/controllers/teacher/exercise.controller";

/**
 * GET /api/teacher/exercises/[id]
 * Get a single exercise by ID
 */
export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exerciseId = parseInt(id);
    const exercise = await getTeacherExerciseById(exerciseId, userId);

    return NextResponse.json({
      success: true,
      data: exercise,
    });
  } catch (error: any) {
    console.error("Error fetching exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch exercise" },
      { status: 500 }
    );
  }
};

/**
 * PUT /api/teacher/exercises/[id]
 * Update an exercise
 */
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exerciseId = parseInt(id);
    const body = await req.json();
    const exercise = await updateTeacherExercise(exerciseId, userId, body);

    return NextResponse.json({
      success: true,
      data: exercise,
    });
  } catch (error: any) {
    console.error("Error updating exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update exercise" },
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/teacher/exercises/[id]
 * Delete an exercise
 */
export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exerciseId = parseInt(id);
    await deleteTeacherExercise(exerciseId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete exercise" },
      { status: 500 }
    );
  }
};

