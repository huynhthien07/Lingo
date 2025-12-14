/**
 * Teacher Unit Management API Routes - Single Unit
 * GET /api/teacher/units/[id] - Get unit by ID
 * PUT /api/teacher/units/[id] - Update unit
 * DELETE /api/teacher/units/[id] - Delete unit
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherUnitById,
  updateTeacherUnit,
  deleteTeacherUnit,
} from "@/lib/controllers/teacher/unit.controller";

/**
 * GET /api/teacher/units/[id]
 * Get a single unit by ID
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

    const unitId = parseInt(params.id);
    const unit = await getTeacherUnitById(unitId, userId);

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error: any) {
    console.error("Error fetching unit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch unit" },
      { status: 500 }
    );
  }
};

/**
 * PUT /api/teacher/units/[id]
 * Update a unit
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

    const unitId = parseInt(params.id);
    const body = await req.json();
    const unit = await updateTeacherUnit(unitId, userId, body);

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error: any) {
    console.error("Error updating unit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update unit" },
      { status: 500 }
    );
  }
};

/**
 * DELETE /api/teacher/units/[id]
 * Delete a unit
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

    const unitId = parseInt(params.id);
    await deleteTeacherUnit(unitId, userId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Error deleting unit:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete unit" },
      { status: 500 }
    );
  }
};

