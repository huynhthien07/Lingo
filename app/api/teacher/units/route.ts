/**
 * Teacher Unit Management API Routes
 * GET /api/teacher/units - List units with pagination
 * POST /api/teacher/units - Create new unit
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherUnits,
  createTeacherUnit,
} from "@/lib/controllers/teacher/unit.controller";

/**
 * GET /api/teacher/units
 * Get paginated list of units for the authenticated teacher
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
    const courseId = searchParams.get("courseId") || undefined;
    const unassigned = searchParams.get("unassigned") === "true";

    const result = await getTeacherUnits(userId, {
      page,
      limit,
      search,
      courseId: courseId ? parseInt(courseId) : undefined,
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
    console.error("Error fetching units:", error);
    return NextResponse.json(
      { error: "Failed to fetch units" },
      { status: 500 }
    );
  }
};

/**
 * POST /api/teacher/units
 * Create a new unit
 */
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const unit = await createTeacherUnit(userId, body);

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error: any) {
    console.error("Error creating unit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create unit" },
      { status: 500 }
    );
  }
};

