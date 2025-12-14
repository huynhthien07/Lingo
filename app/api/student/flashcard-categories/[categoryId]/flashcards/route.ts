/**
 * Student Flashcards API
 * GET /api/student/flashcard-categories/[categoryId]/flashcards - Get flashcards with progress
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getCategoryFlashcardsWithProgress } from "@/lib/controllers/student/flashcard.controller";

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

    const flashcards = await getCategoryFlashcardsWithProgress(
      parseInt(categoryId),
      userId
    );

    return NextResponse.json({
      success: true,
      data: flashcards,
    });
  } catch (error) {
    console.error("Error in GET /api/student/flashcard-categories/[categoryId]/flashcards:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
};

