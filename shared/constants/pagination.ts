/**
 * Pagination Constants
 * 
 * Shared constants for pagination
 */

/**
 * Default pagination values
 */
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 25,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1,
} as const;

/**
 * Sort orders
 */
export const SORT_ORDER = {
    ASC: 'asc',
    DESC: 'desc',
} as const;

/**
 * Common sort fields
 */
export const SORT_FIELDS = {
    ID: 'id',
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    TITLE: 'title',
    NAME: 'name',
    ORDER: 'order',
} as const;

