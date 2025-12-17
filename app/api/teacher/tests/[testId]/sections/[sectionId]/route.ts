import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  updateTestSection,
  deleteTestSection,
} from "@/lib/controllers/teacher/test.controller";

export async function PUT(
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

    const section = await updateTestSection(parseInt(sectionId), {
      title: body.title,
      skillType: body.skillType,
      duration: body.duration,
      passage: body.passage,
      imageSrc: body.imageSrc,
      audioSrc: body.audioSrc,
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error updating test section:", error);
    return NextResponse.json(
      { error: "Failed to update test section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ testId: string; sectionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionId } = await context.params;

    await deleteTestSection(parseInt(sectionId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting test section:", error);
    return NextResponse.json(
      { error: "Failed to delete test section" },
      { status: 500 }
    );
  }
}

