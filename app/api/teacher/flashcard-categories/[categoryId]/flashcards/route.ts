/**
 * Teacher Flashcards API
 * GET /api/teacher/flashcard-categories/[categoryId]/flashcards - Get flashcards for category
 * POST /api/teacher/flashcard-categories/[categoryId]/flashcards - Create new flashcard
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getCategoryFlashcards,
  createFlashcard,
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
    const { searchParams } = new URL(req.url);

    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      search: searchParams.get("search") || "",
    };

    const result = await getCategoryFlashcards(
      parseInt(categoryId),
      userId,
      options
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Error in GET /api/teacher/flashcard-categories/[categoryId]/flashcards:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
};

export const POST = async (
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

    if (!body.word || !body.definition) {
      return NextResponse.json(
        { error: "Word and definition are required" },
        { status: 400 }
      );
    }

    const flashcard = await createFlashcard(userId, {
      categoryId: parseInt(categoryId),
      ...body,
    });

    return NextResponse.json({
      success: true,
      data: flashcard,
    });
  } catch (error) {
    console.error("Error in POST /api/teacher/flashcard-categories/[categoryId]/flashcards:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to create flashcard" },
      { status: 500 }
    );
  }
};

