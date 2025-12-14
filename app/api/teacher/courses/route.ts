/**
 * Teacher Course Management API Routes
 * GET /api/teacher/courses - List courses with pagination
 * POST /api/teacher/courses - Create new course
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherCourses,
  createTeacherCourse,
} from "@/lib/controllers/teacher/course.controller";

/**
 * GET /api/teacher/courses
 * Get paginated list of courses for the authenticated teacher
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
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
    const examType = searchParams.get("examType") || undefined;
    const level = searchParams.get("level") || undefined;

    const result = await getTeacherCourses(userId, {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      examType,
      level,
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
    console.error("Error in GET /api/teacher/courses:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

/**
 * POST /api/teacher/courses
 * Create a new course
 */
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    if (!body.title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const course = await createTeacherCourse(userId, body);

    return NextResponse.json({ success: true, data: course }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/teacher/courses:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};

