import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  updateChallengeOption,
  deleteChallengeOption,
} from "@/lib/controllers/teacher/exercise.controller";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { optionId } = await params;
    const optionIdNum = parseInt(optionId);

    if (isNaN(optionIdNum)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
    }

    const body = await request.json();

    const option = await updateChallengeOption(optionIdNum, userId, body);

    return NextResponse.json({ success: true, data: option });
  } catch (error: any) {
    console.error("Error updating challenge option:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; optionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { optionId } = await params;
    const optionIdNum = parseInt(optionId);

    if (isNaN(optionIdNum)) {
      return NextResponse.json({ error: "Invalid option ID" }, { status: 400 });
    }

    await deleteChallengeOption(optionIdNum, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting challenge option:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete option" },
      { status: 500 }
    );
  }
}

