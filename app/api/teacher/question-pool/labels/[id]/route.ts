/**
 * DELETE /api/teacher/question-pool/labels/[id]
 * Delete a label by ID
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questionLabels } from "@/db/schema";
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
    const labelId = parseInt(id);

    if (isNaN(labelId)) {
      return NextResponse.json({ error: "Invalid label ID" }, { status: 400 });
    }

    // Delete the label
    await db.delete(questionLabels).where(eq(questionLabels.id, labelId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting label:", error);
    return NextResponse.json(
      { error: "Failed to delete label" },
      { status: 500 }
    );
  }
}

