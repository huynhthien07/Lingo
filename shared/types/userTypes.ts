/**
 * User Types
 * 
 * Shared type definitions for user-related data
 */

/**
 * User role enum
 */
export type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

/**
 * User status enum
 */
export type UserStatus = 'active' | 'blocked';

/**
 * User interface
 */
export interface User {
    id?: number;
    userId: string;
    email: string;
    userName: string;
    firstName?: string | null;
    lastName?: string | null;
    userImageSrc?: string | null;
    status: UserStatus;
    role: UserRole;
    language?: string | null;
    createdAt?: Date;
    lastLoginAt?: Date | null;
}

/**
 * Create user DTO (Data Transfer Object)
 */
export interface CreateUserDTO {
    email: string;
    userName: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: UserRole;
}

/**
 * Update user DTO
 */
export interface UpdateUserDTO {
    email?: string;
    userName?: string;
    firstName?: string;
    lastName?: string;
    userImageSrc?: string;
    status?: UserStatus;
    role?: UserRole;
    language?: string;
}

/**
 * User with progress data
 */
export interface UserWithProgress extends User {
    points?: number;
    level?: number;
    overallBandScore?: number | null;
    activeCourse?: {
        id: number;
        title: string;
    } | null;
}

