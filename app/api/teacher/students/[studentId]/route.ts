/**
 * Teacher Student Detail API Routes
 * GET /api/teacher/students/[studentId] - Get student detail with progress
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTeacherStudentDetail } from "@/lib/controllers/teacher/student.controller";

/**
 * GET /api/teacher/students/[studentId]
 * Get student detail with progress
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;
    const searchParams = req.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json({ error: "courseId is required" }, { status: 400 });
    }

    const result = await getTeacherStudentDetail(userId, studentId, parseInt(courseId));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/teacher/students/[studentId]:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

