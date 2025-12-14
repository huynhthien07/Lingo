/**
 * Teacher Course Management API Routes - Single Course
 * GET /api/teacher/courses/[id] - Get course by ID
 * PUT /api/teacher/courses/[id] - Update course
 * DELETE /api/teacher/courses/[id] - Delete course
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherCourseById,
  updateTeacherCourse,
  deleteTeacherCourse,
} from "@/lib/controllers/teacher/course.controller";

/**
 * GET /api/teacher/courses/[id]
 * Get course by ID
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

    const id = parseInt((await params).id);

    const course = await getTeacherCourseById(id, userId);

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error in GET /api/teacher/courses/[id]:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("don't have access")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

/**
 * PUT /api/teacher/courses/[id]
 * Update course
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

    const id = parseInt((await params).id);
    const body = await req.json();

    const course = await updateTeacherCourse(id, userId, body);

    return NextResponse.json({ success: true, data: course });
  } catch (error) {
    console.error("Error in PUT /api/teacher/courses/[id]:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("don't have access")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/teacher/courses/[id]
 * Delete course
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

    const id = parseInt((await params).id);

    const result = await deleteTeacherCourse(id, userId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error in DELETE /api/teacher/courses/[id]:", error);

    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("don't have access")) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes("Cannot delete")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

