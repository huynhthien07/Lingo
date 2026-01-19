/**
 * Start Admission Test API
 * POST /api/admission-tests/[testId]/start - Start admission test (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { tests, testAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * POST /api/admission-tests/[testId]/start
 * Create a new test attempt for admission test
 * Can be used without authentication (for marketing page)
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
    // Try to get userId, but don't require it for admission tests
    const { userId } = await auth();

    const { testId } = await context.params;
    const testIdNum = parseInt(testId);

    if (isNaN(testIdNum)) {
      return NextResponse.json({ error: "Invalid test ID" }, { status: 400 });
    }

    // Get test to verify it's an admission test
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

    if (!test.isAdmission) {
      return NextResponse.json(
        { error: "This is not an admission test" },
        { status: 400 }
      );
    }

    // Calculate total points
    let totalPoints = 0;
    for (const section of test.sections) {
      for (const question of section.questions) {
        totalPoints += question.points;
      }
    }

    // Create test attempt
    // For guest users (admission test), userId can be NULL
    const [attempt] = await db
      .insert(testAttempts)
      .values({
        userId: userId || null, // NULL for guest users
        testId: testIdNum,
        status: "IN_PROGRESS",
        totalPoints,
      })
      .returning();

    return NextResponse.json({
      attempt,
      test: {
        id: test.id,
        title: test.title,
        description: test.description,
        duration: test.duration,
        isAdmission: test.isAdmission,
      },
      isGuest: !userId,
    });
  } catch (error) {
    console.error("Error starting admission test:", error);
    return NextResponse.json(
      { error: "Failed to start test" },
      { status: 500 }
    );
  }
}

