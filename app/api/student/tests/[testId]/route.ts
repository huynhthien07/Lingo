/**
 * Student Test Detail API Routes
 * GET /api/student/tests/[testId] - Get test details
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { tests } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/student/tests/[testId]
 * Get test details with all sections and questions
 */
export async function GET(
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

    // Get test with all sections and questions
    const test = await db.query.tests.findFirst({
      where: eq(tests.id, testIdNum),
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
    });

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

