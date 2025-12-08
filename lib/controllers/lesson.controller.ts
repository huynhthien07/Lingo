/**
 * Lesson Controller
 * 
 * Handles all lesson-related business logic
 */

import { db } from "@/lib/services/database.service";
import { lessons } from "@/db/schema";
import { eq, ilike, and, count, desc, asc, inArray } from "drizzle-orm";

/**
 * Get all lessons with pagination, filtering, and sorting
 */
export const getAllLessons = async (params: {
    title?: string;
    unitId?: number;
    filter?: any;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const {
        title,
        unitId,
        filter,
        page = 1,
        limit = 25,
        sortField = 'order',
        sortOrder = 'asc'
    } = params;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    // Handle React Admin filter parameter (JSON encoded)
    if (filter) {
        // Handle id array filter (for ReferenceInput)
        if (filter.id && Array.isArray(filter.id)) {
            conditions.push(inArray(lessons.id, filter.id.map((id: any) => parseInt(id))));
        }

        // Handle other filters from the parsed filter object
        if (filter.title) {
            conditions.push(ilike(lessons.title, `%${filter.title}%`));
        }
        if (filter.unitId) {
            conditions.push(eq(lessons.unitId, parseInt(filter.unitId)));
        }
    }

    // Handle direct filter parameters (for backward compatibility)
    if (title) {
        conditions.push(ilike(lessons.title, `%${title}%`));
    }
    if (unitId) {
        conditions.push(eq(lessons.unitId, unitId));
    }

    const whereCondition = conditions.length > 0 ?
        (conditions.length > 1 ? and(...conditions) : conditions[0]) :
        undefined;

    // Get total count for pagination
    const totalResult = await db.select({ count: count() })
        .from(lessons)
        .where(whereCondition);
    const total = totalResult[0]?.count || 0;

    // Determine sort order
    const orderBy = sortField === 'order' ?
        (sortOrder === 'desc' ? desc(lessons.order) : asc(lessons.order)) :
        sortField === 'title' ?
            (sortOrder === 'desc' ? desc(lessons.title) : asc(lessons.title)) :
            asc(lessons.id);

    // Get paginated data with relations
    const data = await db.query.lessons.findMany({
        where: whereCondition,
        with: {
            unit: {
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
 * Get lesson by ID
 */
export const getLessonById = async (lessonId: number) => {
    const lesson = await db.query.lessons.findFirst({
        where: eq(lessons.id, lessonId),
        with: {
            unit: true,
        },
    });

    if (!lesson) {
        throw new Error("Lesson not found");
    }

    return lesson;
};

/**
 * Create a new lesson
 */
export const createLesson = async (lessonData: {
    title: string;
    unitId: number;
    order: number;
}) => {
    const { title, unitId, order } = lessonData;

    // Validate required fields
    if (!title || !unitId || order === undefined) {
        throw new Error("Title, unitId, and order are required");
    }

    // Create lesson
    const newLesson = await db.insert(lessons).values({
        title,
        unitId,
        order,
    }).returning();

    return newLesson[0];
};

/**
 * Update lesson
 */
export const updateLesson = async (lessonId: number, lessonData: any) => {
    const updatedLesson = await db.update(lessons)
        .set(lessonData)
        .where(eq(lessons.id, lessonId))
        .returning();

    if (!updatedLesson || updatedLesson.length === 0) {
        throw new Error("Lesson not found");
    }

    return updatedLesson[0];
};

/**
 * Delete lesson
 */
export const deleteLesson = async (lessonId: number) => {
    const deletedLesson = await db.delete(lessons)
        .where(eq(lessons.id, lessonId))
        .returning();

    if (!deletedLesson || deletedLesson.length === 0) {
        throw new Error("Lesson not found");
    }

    return deletedLesson[0];
};

/**
 * Bulk delete lessons
 */
export const bulkDeleteLessons = async (lessonIds: number[]) => {
    if (!lessonIds || lessonIds.length === 0) {
        throw new Error("No lesson IDs provided");
    }

    const deletedLessons = await db.delete(lessons)
        .where(inArray(lessons.id, lessonIds))
        .returning();

    return deletedLessons;
};

/**
 * Bulk update lessons
 */
export const bulkUpdateLessons = async (lessonIds: number[], updateData: any) => {
    if (!lessonIds || lessonIds.length === 0) {
        throw new Error("No lesson IDs provided");
    }

    const updatedLessons = await db.update(lessons)
        .set(updateData)
        .where(inArray(lessons.id, lessonIds))
        .returning();

    return updatedLessons;
};;

