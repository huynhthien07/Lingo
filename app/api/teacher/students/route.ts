/**
 * Teacher Students API Routes
 * GET /api/teacher/students - Get list of students enrolled in teacher's courses
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTeacherStudents } from "@/lib/controllers/teacher/student.controller";

/**
 * GET /api/teacher/students
 * Get paginated list of students
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const courseId = searchParams.get("courseId");
    const status = searchParams.get("status");

    const result = await getTeacherStudents(userId, {
      page,
      limit,
      search,
      courseId: courseId ? parseInt(courseId) : undefined,
      status: status || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/teacher/students:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

