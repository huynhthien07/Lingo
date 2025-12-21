import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { tests, testSections, testQuestions, testAttempts, testSubmissions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * GET /api/teacher/submissions/check-tests
 * Check if there are any tests with Writing/Speaking questions
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all tests
    const allTests = await db.select().from(tests);

    // Get all sections with skillType
    const allSections = await db.select().from(testSections);

    // Get all questions
    const allQuestions = await db.select().from(testQuestions);

    // Get all test attempts
    const allAttempts = await db.select().from(testAttempts);

    // Get all test submissions
    const allSubmissions = await db.select().from(testSubmissions);

    // Find Writing/Speaking sections
    const writingSpeakingSections = allSections.filter(
      (s) => s.skillType === "WRITING" || s.skillType === "SPEAKING"
    );

    // Find questions in those sections
    const writingSpeakingQuestions = allQuestions.filter((q) =>
      writingSpeakingSections.some((s) => s.id === q.sectionId)
    );

    // Group by test
    const testInfo = allTests.map((test) => {
      const testSections = allSections.filter((s) => s.testId === test.id);
      const wsSections = testSections.filter(
        (s) => s.skillType === "WRITING" || s.skillType === "SPEAKING"
      );
      const wsQuestions = allQuestions.filter((q) =>
        wsSections.some((s) => s.id === q.sectionId)
      );

      return {
        testId: test.id,
        testTitle: test.title,
        testType: test.testType,
        totalSections: testSections.length,
        writingSpeakingSections: wsSections.length,
        writingSpeakingQuestions: wsQuestions.length,
        sections: wsSections.map((s) => ({
          id: s.id,
          title: s.title,
          skillType: s.skillType,
          questionCount: allQuestions.filter((q) => q.sectionId === s.id).length,
        })),
      };
    });

    return NextResponse.json({
      summary: {
        totalTests: allTests.length,
        totalSections: allSections.length,
        totalQuestions: allQuestions.length,
        writingSpeakingSections: writingSpeakingSections.length,
        writingSpeakingQuestions: writingSpeakingQuestions.length,
        totalAttempts: allAttempts.length,
        totalSubmissions: allSubmissions.length,
      },
      tests: testInfo,
      writingSpeakingSections: writingSpeakingSections,
      writingSpeakingQuestions: writingSpeakingQuestions.map((q) => ({
        id: q.id,
        sectionId: q.sectionId,
        questionText: q.questionText?.substring(0, 100),
        questionType: q.questionType,
      })),
      attempts: allAttempts.map((a) => ({
        id: a.id,
        testId: a.testId,
        userId: a.userId,
        status: a.status,
        startedAt: a.startedAt,
        completedAt: a.completedAt,
      })),
      submissions: allSubmissions,
    });
  } catch (error) {
    console.error("Error in check-tests endpoint:", error);
    return NextResponse.json(
      { error: "Failed to check tests", details: String(error) },
      { status: 500 }
    );
  }
}

