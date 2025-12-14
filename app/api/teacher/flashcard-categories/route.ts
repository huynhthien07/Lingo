/**
 * Teacher Flashcard Categories API
 * GET /api/teacher/flashcard-categories - Get all categories
 * POST /api/teacher/flashcard-categories - Create new category
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTeacherCategories,
  createCategory,
} from "@/lib/controllers/teacher/flashcard.controller";

export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categories = await getTeacherCategories(userId);

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error in GET /api/teacher/flashcard-categories:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const category = await createCategory(userId, { name, description });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error in POST /api/teacher/flashcard-categories:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
};

