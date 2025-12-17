import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { addTestSection } from "@/lib/controllers/teacher/test.controller";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await context.params;
    const body = await request.json();

    const section = await addTestSection({
      testId: parseInt(testId),
      title: body.title,
      skillType: body.skillType,
      duration: body.duration,
      passage: body.passage,
      imageSrc: body.imageSrc,
      audioSrc: body.audioSrc,
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error adding test section:", error);
    return NextResponse.json(
      { error: "Failed to add test section" },
      { status: 500 }
    );
  }
}

