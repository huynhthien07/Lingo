import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addTestQuestion } from "@/lib/controllers/teacher/test.controller";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ testId: string; sectionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionId } = await context.params;
    const body = await request.json();

    const question = await addTestQuestion({
      sectionId: parseInt(sectionId),
      questionText: body.questionText,
      passage: body.passage || null,
      audioSrc: body.audioSrc || null,
      points: body.points,
      options: body.options,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error adding test question:", error);
    return NextResponse.json(
      { error: "Failed to add test question" },
      { status: 500 }
    );
  }
}

