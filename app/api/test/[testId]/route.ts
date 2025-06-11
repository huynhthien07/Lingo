import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { tests, testQuestions, testOptions } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    // Get the test
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, testId_num),
    });

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    // Get the questions for this test
    const questions = await db.query.testQuestions.findMany({
      where: eq(testQuestions.testId, testId_num),
      with: {
        options: true,
      },
      orderBy: (testQuestions, { asc }) => [asc(testQuestions.order)],
    });

    return NextResponse.json({
      ...test,
      questions,
    });
  } catch (error) {
    console.error("Error fetching test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}
