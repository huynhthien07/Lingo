/**
 * Teacher Lesson Management API Routes - Single Lesson
 * GET /api/teacher/lessons/[id] - Get lesson by ID
 * PUT /api/teacher/lessons/[id] - Update lesson
 * DELETE /api/teacher/lessons/[id] - Delete lesson
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherLessonById,
  updateTeacherLesson,
  deleteTeacherLesson,
} from "@/lib/controllers/teacher/lesson.controller";

/**
 * GET /api/teacher/lessons/[id]
 * Get a single lesson by ID
 */
export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonId = parseInt(params.id);
    const lesson = await getTeacherLessonById(lessonId, userId);

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch lesson" },
      { status: 500 }
    );
  }
};

/**
 * PUT /api/teacher/lessons/[id]
 * Update a lesson
 */
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonId = parseInt(params.id);
    const body = await req.json();
    const lesson = await updateTeacherLesson(lessonId, userId, body);

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    console.error("Error updating lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update lesson" },
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/teacher/lessons/[id]
 * Delete a lesson
 */
export const DELETE = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lessonId = parseInt(params.id);
    await deleteTeacherLesson(lessonId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete lesson" },
      { status: 500 }
    );
  }
};

