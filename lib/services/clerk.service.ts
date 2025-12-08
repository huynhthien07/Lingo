/**
 * Clerk Service
 * 
 * Handles all interactions with Clerk authentication service
 * This service encapsulates Clerk API calls and provides a clean interface
 * for user authentication and management operations.
 */

import { createClerkClient } from "@clerk/backend";
import { clerkClient as nextClerkClient } from "@clerk/nextjs/server";

/**
 * Get Clerk client instance
 * Uses Next.js Clerk client for server components
 */
export const getClerkClient = async () => {
    return await nextClerkClient();
};

/**
 * Create a standalone Clerk client with explicit secret key
 * Useful for scripts and background jobs
 */
export const createStandaloneClerkClient = () => {
    if (!process.env.CLERK_SECRET_KEY) {
        throw new Error("CLERK_SECRET_KEY is not defined");
    }
    
    return createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY,
    });
};

/**
 * Get all users from Clerk
 * @param limit - Maximum number of users to fetch (default: 500)
 * @returns List of Clerk users
 */
export const getAllClerkUsers = async (limit: number = 500) => {
    const client = await getClerkClient();
    const response = await client.users.getUserList({ limit });
    return response.data;
};

/**
 * Get a single user from Clerk by ID
 * @param userId - Clerk user ID
 * @returns Clerk user object
 */
export const getClerkUserById = async (userId: string) => {
    const client = await getClerkClient();
    return await client.users.getUser(userId);
};

/**
 * Create a new user in Clerk
 * @param userData - User data for creation
 * @returns Created Clerk user
 */
export const createClerkUser = async (userData: {
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    role?: string;
}) => {
    const client = await getClerkClient();
    
    return await client.users.createUser({
        emailAddress: [userData.email],
        username: userData.username,
        firstName: userData.firstName || undefined,
        lastName: userData.lastName || undefined,
        password: userData.password || undefined,
        publicMetadata: {
            role: userData.role || 'STUDENT',
        },
    });
};

/**
 * Update a user in Clerk
 * @param userId - Clerk user ID
 * @param userData - Data to update
 * @returns Updated Clerk user
 */
export const updateClerkUser = async (
    userId: string,
    userData: {
        firstName?: string;
        lastName?: string;
        username?: string;
        role?: string;
    }
) => {
    const client = await getClerkClient();
    
    const updateData: any = {};
    
    if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
    if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
    if (userData.username !== undefined) updateData.username = userData.username;
    
    if (userData.role !== undefined) {
        updateData.publicMetadata = { role: userData.role };
    }
    
    return await client.users.updateUser(userId, updateData);
};

/**
 * Delete a user from Clerk
 * @param userId - Clerk user ID
 * @returns Deleted user object
 */
export const deleteClerkUser = async (userId: string) => {
    const client = await getClerkClient();
    return await client.users.deleteUser(userId);
};

/**
 * Send password reset email to user
 * @param userId - Clerk user ID
 */
export const sendPasswordResetEmail = async (userId: string) => {
    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    
    // Clerk automatically sends password reset email when password is not set
    // This is a placeholder for future implementation
    console.log(`Password reset email would be sent to user ${userId}`);
    return { success: true, email: user.emailAddresses[0]?.emailAddress };
};

/**
 * Get user's role from Clerk metadata
 * @param userId - Clerk user ID
 * @returns User role (STUDENT, TEACHER, ADMIN)
 */
export const getUserRole = async (userId: string): Promise<string> => {
    const client = await getClerkClient();
    const user = await client.users.getUser(userId);
    return (user.publicMetadata?.role as string) || 'STUDENT';
};

/**
 * Check if user is admin
 * @param userId - Clerk user ID
 * @returns True if user is admin
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
    const role = await getUserRole(userId);
    return role === 'ADMIN';
};

