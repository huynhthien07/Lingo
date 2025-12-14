import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { createChallengeOption } from "@/lib/controllers/teacher/exercise.controller";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const exerciseId = parseInt(id);

    if (isNaN(exerciseId)) {
      return NextResponse.json({ error: "Invalid exercise ID" }, { status: 400 });
    }

    const body = await request.json();

    const option = await createChallengeOption(exerciseId, userId, body);

    return NextResponse.json({ success: true, data: option });
  } catch (error: any) {
    console.error("Error creating challenge option:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create option" },
      { status: 500 }
    );
  }
}

