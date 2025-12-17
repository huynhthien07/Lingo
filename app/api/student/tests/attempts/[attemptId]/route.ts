/**
 * Test Attempt Detail API
 * GET /api/student/tests/attempts/[attemptId] - Get attempt details with answers
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testAttempts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * GET /api/student/tests/attempts/[attemptId]
 * Get test attempt with all answers
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ attemptId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { attemptId } = await context.params;
    const attemptIdNum = parseInt(attemptId);

    if (isNaN(attemptIdNum)) {
      return NextResponse.json({ error: "Invalid attempt ID" }, { status: 400 });
    }

    // Get attempt with answers
    const attempt = await db.query.testAttempts.findFirst({
      where: and(
        eq(testAttempts.id, attemptIdNum),
        eq(testAttempts.userId, userId)
      ),
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

    return NextResponse.json(attempt);
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return NextResponse.json(
      { error: "Failed to fetch attempt" },
      { status: 500 }
    );
  }
}

