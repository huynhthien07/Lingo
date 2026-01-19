/**
 * DELETE /api/teacher/question-pool/targets/[id]
 * Delete a target by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questionTargets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const targetId = parseInt(id);

    if (isNaN(targetId)) {
      return NextResponse.json({ error: "Invalid target ID" }, { status: 400 });
    }

    // Delete the target
    await db.delete(questionTargets).where(eq(questionTargets.id, targetId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting target:", error);
    return NextResponse.json(
      { error: "Failed to delete target" },
      { status: 500 }
    );
  }
}

