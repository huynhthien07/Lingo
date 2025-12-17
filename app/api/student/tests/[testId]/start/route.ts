/**
 * Start Test Attempt API
 * POST /api/student/tests/[testId]/start - Start a new test attempt
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { tests, testAttempts, testSections } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/student/tests/[testId]/start
 * Create a new test attempt
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { testId } = await context.params;
    const testIdNum = parseInt(testId);

    if (isNaN(testIdNum)) {
      return NextResponse.json({ error: "Invalid test ID" }, { status: 400 });
    }

    // Get test to calculate total points
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, testIdNum),
      with: {
        sections: {
          with: {
            questions: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Test not found" }, { status: 404 });
    }

    // Calculate total points
    const totalPoints = test.sections.reduce(
      (sum, section) =>
        sum +
        section.questions.reduce((qSum, q) => qSum + (q.points || 1), 0),
      0
    );

    // Create new test attempt
    const [attempt] = await db
      .insert(testAttempts)
      .values({
        userId,
        testId: testIdNum,
        status: "IN_PROGRESS",
        totalPoints,
        startedAt: new Date(),
      })
      .returning();

    return NextResponse.json(attempt, { status: 201 });
  } catch (error) {
    console.error("Error starting test:", error);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    );
  }
}

