/**
 * Student Flashcard Progress API
 * POST /api/student/flashcards/[flashcardId]/progress - Update progress
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateFlashcardProgress } from "@/lib/controllers/student/flashcard.controller";

export const POST = async (
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
    const { isCorrect } = body;

    if (typeof isCorrect !== "boolean") {
      return NextResponse.json(
        { error: "isCorrect must be a boolean" },
        { status: 400 }
      );
    }

    const progress = await updateFlashcardProgress(
      userId,
      parseInt(flashcardId),
      isCorrect
    );

    return NextResponse.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error("Error in POST /api/student/flashcards/[flashcardId]/progress:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
};

