/**
 * Challenge Controller
 * 
 * Handles all challenge-related business logic
 */

import { db } from "@/lib/services/database.service";
import { challenges } from "@/db/schema";
import { eq, ilike, and, count, desc, asc, inArray } from "drizzle-orm";

/**
 * Get all challenges with pagination, filtering, and sorting
 */
export const getAllChallenges = async (params: {
    question?: string;
    lessonId?: number;
    type?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const {
        question,
        lessonId,
        type,
        page = 1,
        limit = 25,
        sortField = 'order',
        sortOrder = 'asc'
    } = params;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (question) {
        conditions.push(ilike(challenges.question, `%${question}%`));
    }
    if (lessonId) {
        conditions.push(eq(challenges.lessonId, lessonId));
    }
    if (type) {
        conditions.push(eq(challenges.type, type as any));
    }

    const whereCondition = conditions.length > 0 ?
        (conditions.length > 1 ? and(...conditions) : conditions[0]) :
        undefined;

    // Get total count for pagination
    const totalResult = await db.select({ count: count() })
        .from(challenges)
        .where(whereCondition);
    const total = totalResult[0]?.count || 0;

    // Determine sort order
    const orderBy = sortField === 'order' ?
        (sortOrder === 'desc' ? desc(challenges.order) : asc(challenges.order)) :
        sortField === 'question' ?
            (sortOrder === 'desc' ? desc(challenges.question) : asc(challenges.question)) :
            asc(challenges.id);

    // Get paginated data with relations
    const data = await db.query.challenges.findMany({
        where: whereCondition,
        with: {
            lesson: {
                columns: {
                    id: true,
                    title: true,
                },
            },
        },
        orderBy: [orderBy],
        limit: limit,
        offset: offset,
    });

    return {
        data,
        total,
        page,
        limit,
    };
};

/**
 * Get challenge by ID
 */
export const getChallengeById = async (challengeId: number) => {
    const challenge = await db.query.challenges.findFirst({
        where: eq(challenges.id, challengeId),
        with: {
            lesson: true,
            challengeOptions: true,
        },
    });

    if (!challenge) {
        throw new Error("Challenge not found");
    }

    return challenge;
};

/**
 * Create a new challenge
 */
export const createChallenge = async (challengeData: {
    lessonId: number;
    type: string;
    question: string;
    order: number;
}) => {
    const { lessonId, type, question, order } = challengeData;

    // Validate required fields
    if (!lessonId || !type || !question || order === undefined) {
        throw new Error("LessonId, type, question, and order are required");
    }

    // Create challenge
    const newChallenge = await db.insert(challenges).values({
        lessonId,
        type: type as any,
        question,
        order,
    }).returning();

    return newChallenge[0];
};

/**
 * Update challenge
 */
export const updateChallenge = async (challengeId: number, challengeData: any) => {
    const updatedChallenge = await db.update(challenges)
        .set(challengeData)
        .where(eq(challenges.id, challengeId))
        .returning();

    if (!updatedChallenge || updatedChallenge.length === 0) {
        throw new Error("Challenge not found");
    }

    return updatedChallenge[0];
};

/**
 * Delete challenge
 */
export const deleteChallenge = async (challengeId: number) => {
    const deletedChallenge = await db.delete(challenges)
        .where(eq(challenges.id, challengeId))
        .returning();

    if (!deletedChallenge || deletedChallenge.length === 0) {
        throw new Error("Challenge not found");
    }

    return deletedChallenge[0];
};

/**
 * Bulk delete challenges
 */
export const bulkDeleteChallenges = async (challengeIds: number[]) => {
    if (!challengeIds || challengeIds.length === 0) {
        throw new Error("No challenge IDs provided");
    }

    const deletedChallenges = await db.delete(challenges)
        .where(inArray(challenges.id, challengeIds))
        .returning();

    return deletedChallenges;
};

