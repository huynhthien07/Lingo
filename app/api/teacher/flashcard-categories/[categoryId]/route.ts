/**
 * Teacher Flashcard Category API (Single)
 * GET /api/teacher/flashcard-categories/[categoryId] - Get category by ID
 * PATCH /api/teacher/flashcard-categories/[categoryId] - Update category
 * DELETE /api/teacher/flashcard-categories/[categoryId] - Delete category
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "@/lib/controllers/teacher/flashcard.controller";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId } = await params;
    const category = await getCategoryById(parseInt(categoryId), userId);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error in GET /api/teacher/flashcard-categories/[categoryId]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId } = await params;
    const body = await req.json();

    const category = await updateCategory(parseInt(categoryId), userId, body);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error in PATCH /api/teacher/flashcard-categories/[categoryId]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { categoryId } = await params;
    await deleteCategory(parseInt(categoryId), userId);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/teacher/flashcard-categories/[categoryId]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
};

