/**
 * Student Tests API Routes
 * GET /api/student/tests - Get all available tests
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { tests, testAttempts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/student/tests
 * Get all available tests with user's attempt history
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const testType = searchParams.get("testType") || undefined;
    const examType = searchParams.get("examType") || undefined;

    // Get all tests
    let query = db.query.tests.findMany({
      orderBy: [desc(tests.createdAt)],
      with: {
        sections: {
          with: {
            questions: {
              with: {
                options: true,
              },
            },
          },
        },
      },
    });

    const allTests = await query;

    // Filter by testType and examType if provided
    let filteredTests = allTests;
    if (testType) {
      filteredTests = filteredTests.filter((t) => t.testType === testType);
    }
    if (examType) {
      filteredTests = filteredTests.filter((t) => t.examType === examType);
    }

    // Get user's test attempts
    const userAttempts = await db.query.testAttempts.findMany({
      where: eq(testAttempts.userId, userId),
      orderBy: [desc(testAttempts.startedAt)],
    });

    // Combine test data with attempt history
    const testsWithAttempts = filteredTests.map((test) => {
      const attempts = userAttempts.filter((a) => a.testId === test.id);
      const lastAttempt = attempts[0] || null;
      const totalQuestions = test.sections.reduce(
        (sum, section) => sum + section.questions.length,
        0
      );

      return {
        ...test,
        totalQuestions,
        attemptCount: attempts.length,
        lastAttempt,
        canRetake: true, // You can add logic here to limit retakes
      };
    });

    return NextResponse.json({
      tests: testsWithAttempts,
      total: testsWithAttempts.length,
    });
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

