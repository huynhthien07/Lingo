import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { questionTargets } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/teacher/question-pool/targets
 * Fetch all targets for a lesson or test
 * Query params: ?lessonId=X or ?testId=Y
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const testId = searchParams.get("testId");

    if (!lessonId && !testId) {
      return NextResponse.json(
        { error: "Either lessonId or testId is required" },
        { status: 400 }
      );
    }

    let targets;
    if (lessonId) {
      targets = await db.query.questionTargets.findMany({
        where: eq(questionTargets.lessonId, parseInt(lessonId)),
        orderBy: (targets, { asc }) => [asc(targets.id)],
      });
    } else if (testId) {
      targets = await db.query.questionTargets.findMany({
        where: eq(questionTargets.testId, parseInt(testId)),
        orderBy: (targets, { asc }) => [asc(targets.id)],
      });
    }

    return NextResponse.json({ targets });
  } catch (error) {
    console.error("Error fetching targets:", error);
    return NextResponse.json(
      { error: "Failed to fetch targets" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teacher/question-pool/targets
 * Create a new target
 * Body: { lessonId?, testId?, imageSrc, x, y }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lessonId, testId, imageSrc, x, y } = body;

    // Validation
    if (!lessonId && !testId) {
      return NextResponse.json(
        { error: "Either lessonId or testId is required" },
        { status: 400 }
      );
    }

    if (!imageSrc || typeof x !== "number" || typeof y !== "number") {
      return NextResponse.json(
        { error: "imageSrc, x, and y are required" },
        { status: 400 }
      );
    }

    if (x < 0 || x > 100 || y < 0 || y > 100) {
      return NextResponse.json(
        { error: "x and y must be between 0 and 100 (percentage)" },
        { status: 400 }
      );
    }

    // Create target
    const [target] = await db
      .insert(questionTargets)
      .values({
        imageSrc,
        x,
        y,
        lessonId: lessonId ? parseInt(lessonId) : null,
        testId: testId ? parseInt(testId) : null,
      })
      .returning();

    return NextResponse.json({ target }, { status: 201 });
  } catch (error) {
    console.error("Error creating target:", error);
    return NextResponse.json(
      { error: "Failed to create target" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/teacher/question-pool/targets/:id
 * Delete a target
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Target ID is required" },
        { status: 400 }
      );
    }

    await db.delete(questionTargets).where(eq(questionTargets.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting target:", error);
    return NextResponse.json(
      { error: "Failed to delete target" },
      { status: 500 }
    );
  }
}

