/**
 * Test Controller
 * Handles test management operations
 */

import db from "@/db/drizzle";
import { tests, testQuestions, testSections } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get test by ID with questions and options
 */
export const getTestById = async (testId: number) => {
    // Get the test
    const test = await db.query.tests.findFirst({
        where: eq(tests.id, testId),
    });

    if (!test) {
        throw new Error("Test not found");
    }

    // Get the sections and questions for this test
    const sections = await db.query.testSections.findMany({
        where: eq(testSections.testId, testId),
        with: {
            questions: {
                with: {
                    options: true,
                },
                orderBy: (testQuestions, { asc }) => [asc(testQuestions.order)],
            },
        },
        orderBy: (testSections, { asc }) => [asc(testSections.order)],
    });

    const questions = sections.flatMap(section => section.questions);

    return {
        ...test,
        questions,
    };
};

