/**
 * API Types
 * 
 * Shared type definitions for API requests and responses
 */

/**
 * Pagination parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages?: number;
}

/**
 * API error response
 */
export interface ApiError {
    error: string;
    message?: string;
    details?: any;
    statusCode?: number;
}

/**
 * API success response
 */
export interface ApiSuccess<T = any> {
    success: boolean;
    message?: string;
    data?: T;
}

/**
 * Filter parameters
 */
export interface FilterParams {
    [key: string]: string | number | boolean | undefined;
}

/**
 * Sort parameters
 */
export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
}

/**
 * Query parameters for list endpoints
 */
export interface ListQueryParams extends PaginationParams {
    filter?: FilterParams;
    search?: string;
}

