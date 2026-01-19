/**
 * Admission Test Detail API
 * GET /api/admission-tests/[testId] - Get admission test details (no auth required)
 */

import { NextRequest, NextResponse } from "next/server";
import db from "@/db/drizzle";
import { tests } from "@/db/schema";
import { eq } from "drizzle-orm";
import { transformMetadata } from "@/lib/utils/metadata-transformer";

/**
 * GET /api/admission-tests/[testId]
 * Get admission test details with all sections and questions
 * No authentication required
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ testId: string }> }
) {
  try {
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

    // Verify it's an admission test
    if (!test.isAdmission) {
      return NextResponse.json(
        { error: "This is not an admission test" },
        { status: 400 }
      );
    }

    // Transform metadata V2 to full format for student display
    for (const section of test.sections) {
      for (const question of section.questions) {
        if (question.metadata && question.questionType) {
          question.metadata = await transformMetadata(
            question.questionType,
            question.metadata,
            undefined,
            test.id
          );
        }
      }
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error("Error fetching admission test:", error);
    return NextResponse.json(
      { error: "Failed to fetch test" },
      { status: 500 }
    );
  }
}

