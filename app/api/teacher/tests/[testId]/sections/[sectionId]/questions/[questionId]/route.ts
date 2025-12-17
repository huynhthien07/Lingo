import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateTestQuestion,
  deleteTestQuestion,
} from "@/lib/controllers/teacher/test.controller";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ testId: string; sectionId: string; questionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await context.params;
    const body = await request.json();

    const question = await updateTestQuestion(parseInt(questionId), {
      questionText: body.questionText,
      imageSrc: body.imageSrc || null,
      audioSrc: body.audioSrc || null,
      points: body.points,
      options: body.options,
    });

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating test question:", error);
    return NextResponse.json(
      { error: "Failed to update test question" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ testId: string; sectionId: string; questionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await context.params;

    await deleteTestQuestion(parseInt(questionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting test question:", error);
    return NextResponse.json(
      { error: "Failed to delete test question" },
      { status: 500 }
    );
  }
}

