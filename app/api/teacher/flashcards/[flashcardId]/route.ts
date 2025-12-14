/**
 * Teacher Flashcard API (Single)
 * GET /api/teacher/flashcards/[flashcardId] - Get flashcard by ID
 * PATCH /api/teacher/flashcards/[flashcardId] - Update flashcard
 * DELETE /api/teacher/flashcards/[flashcardId] - Delete flashcard
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
} from "@/lib/controllers/teacher/flashcard.controller";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;
    const flashcard = await getFlashcardById(parseInt(flashcardId), userId);

    return NextResponse.json({
      success: true,
      data: flashcard,
    });
  } catch (error) {
    console.error("Error in GET /api/teacher/flashcards/[flashcardId]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to fetch flashcard" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;
    const body = await req.json();

    const flashcard = await updateFlashcard(parseInt(flashcardId), userId, body);

    return NextResponse.json({
      success: true,
      data: flashcard,
    });
  } catch (error) {
    console.error("Error in PATCH /api/teacher/flashcards/[flashcardId]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update flashcard" },
      { status: 500 }
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ flashcardId: string }> }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { flashcardId } = await params;
    await deleteFlashcard(parseInt(flashcardId), userId);

    return NextResponse.json({
      success: true,
      message: "Flashcard deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /api/teacher/flashcards/[flashcardId]:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete flashcard" },
      { status: 500 }
    );
  }
};

