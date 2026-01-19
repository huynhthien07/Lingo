/**
 * Admission Test Attempt Detail API
 * GET /api/admission-tests/attempts/[attemptId] - Get attempt details (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { testAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/admission-tests/attempts/[attemptId]
 * Get admission test attempt with all answers
 * No authentication required (for marketing page)
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { attemptId } = await context.params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    // Get attempt with answers (no userId check for admission tests)
    const attempt = await db.query.testAttempts.findFirst({
      where: eq(testAttempts.id, attemptIdNum),
      with: {
        test: {
          with: {
            sections: {
              orderBy: (sections, { asc }) => [asc(sections.order)],
              with: {
                questions: {
                  orderBy: (questions, { asc }) => [asc(questions.order)],
                  with: {
                    options: {
                      orderBy: (options, { asc }) => [asc(options.order)],
                    },
                  },
                },
              },
            },
          },
        },
        answers: true,
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
    }

    // Verify it's an admission test
    if (!attempt.test.isAdmission) {
      return NextResponse.json(
        { error: "This is not an admission test attempt" },
        { status: 400 }
      );
    }

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error fetching admission test attempt:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}

