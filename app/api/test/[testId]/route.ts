import { NextResponse } from "next/server";
import { getTestById } from "@/lib/controllers/test.controller";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ testId: string }> }
) {
  try {
    const { testId } = await params;
    const testId_num = parseInt(testId);

    if (isNaN(testId_num)) {
      return NextResponse.json(
        { error: "Invalid test ID" },
        { status: 400 }
      );
    }

    const testData = await getTestById(testId_num);

    return NextResponse.json(testData);
  } catch (error) {
    console.error("Error in GET /api/test/[testId]:", error);

    if (error instanceof Error && error.message === "Test not found") {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}
