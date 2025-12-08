/**
 * Test Controller
 * Handles test management operations
 */

import db from "@/db/drizzle";
import { tests, testQuestions } from "@/db/schema";
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

    // Get the questions for this test
    const questions = await db.query.testQuestions.findMany({
        where: eq(testQuestions.testId, testId),
        with: {
            options: true,
        },
        orderBy: (testQuestions, { asc }) => [asc(testQuestions.order)],
    });

    return {
        ...test,
        questions,
    };
};

