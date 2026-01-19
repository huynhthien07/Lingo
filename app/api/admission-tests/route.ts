/**
 * Admission Tests API
 * GET /api/admission-tests - Get all admission tests for marketing page
 */

import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { tests } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/admission-tests
 * Get all admission tests (for marketing page, no auth required)
 * Only returns tests with isAdmission = true
 * Only includes Reading and Listening sections (no Speaking/Writing)
 */
export async function GET() {
  try {
    // Get all admission tests
    const admissionTests = await db.query.tests.findMany({
      where: eq(tests.isAdmission, true),
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

    // Filter out Speaking and Writing sections
    const filteredTests = admissionTests.map((test) => ({
      ...test,
      sections: test.sections.filter(
        (section) =>
          section.skillType === "READING" || section.skillType === "LISTENING"
      ),
    }));

    // Only return tests that have at least one Reading or Listening section
    const validTests = filteredTests.filter((test) => test.sections.length > 0);

    return NextResponse.json({
      tests: validTests,
      count: validTests.length,
    });
  } catch (error) {
    console.error("Error fetching admission tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch admission tests" },
      { status: 500 }
    );
  }
}

