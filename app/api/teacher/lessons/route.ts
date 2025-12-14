/**
 * Teacher Lesson Management API Routes
 * GET /api/teacher/lessons - List lessons with pagination
 * POST /api/teacher/lessons - Create new lesson
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherLessons,
  createTeacherLesson,
} from "@/lib/controllers/teacher/lesson.controller";

/**
 * GET /api/teacher/lessons
 * Get paginated list of lessons for the authenticated teacher
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const unitId = searchParams.get("unitId") || undefined;
    const skillType = searchParams.get("skillType") || undefined;
    const unassigned = searchParams.get("unassigned") === "true";

    const result = await getTeacherLessons(userId, {
      page,
      limit,
      search,
      unitId: unitId ? parseInt(unitId) : undefined,
      skillType,
      unassigned,
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
    console.error("Error fetching lessons:", error);
    return NextResponse.json(
      { error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
};

/**
 * POST /api/teacher/lessons
 * Create a new lesson
 */
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const lesson = await createTeacherLesson(userId, body);

    return NextResponse.json({
      success: true,
      data: lesson,
    });
  } catch (error: any) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create lesson" },
      { status: 500 }
    );
  }
};

