/**
 * Database Service
 * 
 * Provides database connection and common database operations
 * This service wraps the Drizzle ORM client and provides utility functions
 */

import db from "@/db/drizzle";
import { eq, and, or, ilike, count, desc, asc, inArray } from "drizzle-orm";

/**
 * Get database client
 * @returns Drizzle database client
 */
export const getDatabase = () => {
    return db;
};

/**
 * Generic pagination helper
 * @param table - Database table
 * @param options - Pagination options
 * @returns Paginated results with total count
 */
export const paginate = async <T>(
    table: any,
    options: {
        page?: number;
        limit?: number;
        where?: any;
        orderBy?: any;
    } = {}
) => {
    const page = options.page || 1;
    const limit = options.limit || 25;
    const offset = (page - 1) * limit;

    // Get total count
    const totalResult = await db
        .select({ count: count() })
        .from(table)
        .where(options.where);
    
    const total = totalResult[0]?.count || 0;

    // Get paginated data
    const data = await db
        .select()
        .from(table)
        .where(options.where)
        .orderBy(options.orderBy || desc(table.id))
        .limit(limit)
        .offset(offset);

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};

/**
 * Generic search helper
 * @param table - Database table
 * @param searchField - Field to search in
 * @param searchTerm - Search term
 * @returns Search results
 */
export const search = async <T>(
    table: any,
    searchField: any,
    searchTerm: string
) => {
    return await db
        .select()
        .from(table)
        .where(ilike(searchField, `%${searchTerm}%`));
};

/**
 * Generic bulk delete helper
 * @param table - Database table
 * @param ids - Array of IDs to delete
 * @returns Deleted records
 */
export const bulkDelete = async <T>(
    table: any,
    idField: any,
    ids: (string | number)[]
) => {
    if (!ids || ids.length === 0) {
        throw new Error("No IDs provided for bulk delete");
    }

    return await db
        .delete(table)
        .where(inArray(idField, ids))
        .returning();
};

/**
 * Generic bulk update helper
 * @param table - Database table
 * @param ids - Array of IDs to update
 * @param data - Data to update
 * @returns Updated records
 */
export const bulkUpdate = async <T>(
    table: any,
    idField: any,
    ids: (string | number)[],
    data: any
) => {
    if (!ids || ids.length === 0) {
        throw new Error("No IDs provided for bulk update");
    }

    return await db
        .update(table)
        .set(data)
        .where(inArray(idField, ids))
        .returning();
};

/**
 * Check if record exists
 * @param table - Database table
 * @param field - Field to check
 * @param value - Value to check
 * @returns True if exists
 */
export const exists = async (
    table: any,
    field: any,
    value: any
): Promise<boolean> => {
    const result = await db
        .select({ count: count() })
        .from(table)
        .where(eq(field, value));
    
    return (result[0]?.count || 0) > 0;
};

/**
 * Transaction helper
 * @param callback - Transaction callback
 * @returns Transaction result
 */
export const transaction = async <T>(
    callback: (tx: typeof db) => Promise<T>
): Promise<T> => {
    return await db.transaction(callback);
};

// Export commonly used operators
export { eq, and, or, ilike, count, desc, asc, inArray };

// Export database instance
export { db };

