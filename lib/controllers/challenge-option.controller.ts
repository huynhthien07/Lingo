/**
 * Challenge Option Controller
 * Handles challenge option management operations
 */

import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { eq, ilike, and, inArray } from "drizzle-orm";

/**
 * Get all challenge options with filtering
 */
export const getAllChallengeOptions = async (params: {
    text?: string;
    correct?: boolean;
    challengeId?: number;
}) => {
    const { text, correct, challengeId } = params;

    if (text || correct !== undefined || challengeId) {
        const conditions = [];
        
        if (text) {
            conditions.push(ilike(challengeOptions.text, `%${text}%`));
        }
        if (correct !== undefined) {
            conditions.push(eq(challengeOptions.correct, correct));
        }
        if (challengeId) {
            conditions.push(eq(challengeOptions.challengeId, challengeId));
        }

        const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

        const data = await db.query.challengeOptions.findMany({
            where: whereCondition,
        });

        return data;
    } else {
        const data = await db.query.challengeOptions.findMany();
        return data;
    }
};

/**
 * Get challenge option by ID
 */
export const getChallengeOptionById = async (id: number) => {
    const data = await db.query.challengeOptions.findFirst({
        where: eq(challengeOptions.id, id),
    });

    if (!data) {
        throw new Error("Challenge option not found");
    }

    return data;
};

/**
 * Create a new challenge option
 */
export const createChallengeOption = async (optionData: any) => {
    const data = await db.insert(challengeOptions).values({
        ...optionData,
    }).returning();

    return data[0];
};

/**
 * Update challenge option by ID
 */
export const updateChallengeOption = async (id: number, optionData: any) => {
    const data = await db.update(challengeOptions)
        .set({
            ...optionData,
        })
        .where(eq(challengeOptions.id, id))
        .returning();

    if (!data || data.length === 0) {
        throw new Error("Challenge option not found");
    }

    return data[0];
};

/**
 * Delete challenge option by ID
 */
export const deleteChallengeOption = async (id: number) => {
    const data = await db.delete(challengeOptions)
        .where(eq(challengeOptions.id, id))
        .returning();

    if (!data || data.length === 0) {
        throw new Error("Challenge option not found");
    }

    return data[0];
};

/**
 * Bulk delete challenge options
 */
export const bulkDeleteChallengeOptions = async (ids: number[]) => {
    const deletedOptions = await db.delete(challengeOptions)
        .where(inArray(challengeOptions.id, ids))
        .returning();

    return deletedOptions;
};

