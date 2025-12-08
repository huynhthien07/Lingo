/**
 * Unit Controller
 * 
 * Handles all unit-related business logic
 */

import { db } from "@/lib/services/database.service";
import { units } from "@/db/schema";
import { eq, ilike, and, count, desc, asc, inArray } from "drizzle-orm";

/**
 * Get all units with pagination, filtering, and sorting
 */
export const getAllUnits = async (params: {
    title?: string;
    courseId?: number;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const {
        title,
        courseId,
        page = 1,
        limit = 25,
        sortField = 'order',
        sortOrder = 'asc'
    } = params;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];
    if (title) {
        conditions.push(ilike(units.title, `%${title}%`));
    }
    if (courseId) {
        conditions.push(eq(units.courseId, courseId));
    }

    const whereCondition = conditions.length > 0 ?
        (conditions.length > 1 ? and(...conditions) : conditions[0]) :
        undefined;

    // Get total count for pagination
    const totalResult = await db.select({ count: count() })
        .from(units)
        .where(whereCondition);
    const total = totalResult[0]?.count || 0;

    // Determine sort order
    const orderBy = sortField === 'order' ?
        (sortOrder === 'desc' ? desc(units.order) : asc(units.order)) :
        sortField === 'title' ?
            (sortOrder === 'desc' ? desc(units.title) : asc(units.title)) :
            asc(units.id);

    // Get paginated data with relations
    const data = await db.query.units.findMany({
        where: whereCondition,
        with: {
            course: {
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
 * Get unit by ID
 */
export const getUnitById = async (unitId: number) => {
    const unit = await db.query.units.findFirst({
        where: eq(units.id, unitId),
        with: {
            course: true,
        },
    });

    if (!unit) {
        throw new Error("Unit not found");
    }

    return unit;
};

/**
 * Create a new unit
 */
export const createUnit = async (unitData: {
    title: string;
    description: string;
    courseId: number;
    order: number;
}) => {
    const { title, description, courseId, order } = unitData;

    // Validate required fields
    if (!title || !description || !courseId || order === undefined) {
        throw new Error("Title, description, courseId, and order are required");
    }

    // Create unit
    const newUnit = await db.insert(units).values({
        title,
        description,
        courseId,
        order,
    }).returning();

    return newUnit[0];
};

/**
 * Update unit
 */
export const updateUnit = async (unitId: number, unitData: any) => {
    const updatedUnit = await db.update(units)
        .set(unitData)
        .where(eq(units.id, unitId))
        .returning();

    if (!updatedUnit || updatedUnit.length === 0) {
        throw new Error("Unit not found");
    }

    return updatedUnit[0];
};

/**
 * Delete unit
 */
export const deleteUnit = async (unitId: number) => {
    const deletedUnit = await db.delete(units)
        .where(eq(units.id, unitId))
        .returning();

    if (!deletedUnit || deletedUnit.length === 0) {
        throw new Error("Unit not found");
    }

    return deletedUnit[0];
};

/**
 * Bulk delete units
 */
export const bulkDeleteUnits = async (unitIds: number[]) => {
    if (!unitIds || unitIds.length === 0) {
        throw new Error("No unit IDs provided");
    }

    const deletedUnits = await db.delete(units)
        .where(inArray(units.id, unitIds))
        .returning();

    return deletedUnits;
};

