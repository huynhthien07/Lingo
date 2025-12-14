/**
 * Teacher Exercise Management API Routes
 * GET /api/teacher/exercises - List exercises with pagination
 * POST /api/teacher/exercises - Create new exercise
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherExercises,
  createTeacherExercise,
} from "@/lib/controllers/teacher/exercise.controller";

/**
 * GET /api/teacher/exercises
 * Get paginated list of exercises for the authenticated teacher
 */
export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const lessonId = searchParams.get("lessonId") || undefined;
    const type = searchParams.get("type") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;

    const result = await getTeacherExercises(userId, {
      page,
      limit,
      search,
      lessonId: lessonId ? parseInt(lessonId) : undefined,
      type,
      difficulty,
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    return NextResponse.json(
      { error: "Failed to fetch exercises" },
      { status: 500 }
    );
  }
};

/**
 * POST /api/teacher/exercises
 * Create a new exercise
 */
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const exercise = await createTeacherExercise(userId, body);

    return NextResponse.json({
      success: true,
      data: exercise,
    });
  } catch (error: any) {
    console.error("Error creating exercise:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create exercise" },
      { status: 500 }
    );
  }
};

