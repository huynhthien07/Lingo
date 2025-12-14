import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getTestById,
  updateTest,
  deleteTest,
} from "@/lib/controllers/teacher/test.controller";

// GET /api/teacher/tests/[testId] - Get test by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const testId = parseInt(params.testId);

    const test = await getTestById(testId);

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

// PUT /api/teacher/tests/[testId] - Update test
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const testId = parseInt(params.testId);
    const body = await request.json();

    const updatedTest = await updateTest(testId, {
      title: body.title,
      description: body.description,
      imageSrc: body.imageSrc,
      testType: body.testType,
      examType: body.examType,
      duration: body.duration,
    });

    return NextResponse.json(updatedTest);
  } catch (error) {
    console.error("Error updating test:", error);
    return NextResponse.json(
      { error: "Failed to update test" },
      { status: 500 }
    );
  }
}

// DELETE /api/teacher/tests/[testId] - Delete test
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await context.params;
    const testId = parseInt(params.testId);

    await deleteTest(testId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting test:", error);
    return NextResponse.json(
      { error: "Failed to delete test" },
      { status: 500 }
    );
  }
}

