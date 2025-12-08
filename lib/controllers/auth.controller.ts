/**
 * Auth Controller
 * 
 * Handles all authentication-related business logic
 */

import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getClerkUserById } from "@/lib/services/clerk.service";

/**
 * Track user login
 * Upserts user data to users table
 */
export const trackUserLogin = async (userId: string, clerkUser: any) => {
    if (!userId || !clerkUser) {
        throw new Error("User ID and Clerk user data are required");
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    const userName = clerkUser.username || email?.split('@')[0] || 'user';
    const firstName = clerkUser.firstName;
    const lastName = clerkUser.lastName;
    const imageUrl = clerkUser.imageUrl;
    const role = clerkUser.publicMetadata?.role || 'STUDENT';

    // Check if user exists
    const existingUsers = await db.select()
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1);

    const existingUser = existingUsers[0];

    if (existingUser) {
        // Update existing user
        const updatedUser = await db.update(users)
            .set({
                email: email || existingUser.email,
                userName: userName,
                firstName: firstName || existingUser.firstName,
                lastName: lastName || existingUser.lastName,
                userImageSrc: imageUrl || existingUser.userImageSrc,
                role: role as any,
                lastLoginAt: new Date(),
            })
            .where(eq(users.userId, userId))
            .returning();

        return updatedUser[0];
    } else {
        // Create new user
        const newUser = await db.insert(users).values({
            userId: userId,
            email: email || '',
            userName: userName,
            firstName: firstName || null,
            lastName: lastName || null,
            userImageSrc: imageUrl || '/mascot.svg',
            status: 'active',
            role: role as any,
            language: 'en',
            createdAt: new Date(),
            lastLoginAt: new Date(),
        }).returning();

        return newUser[0];
    }
};

/**
 * Check if user exists in database
 */
export const checkUserExists = async (userId: string) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    const existingUsers = await db.select()
        .from(users)
        .where(eq(users.userId, userId))
        .limit(1);

    return existingUsers.length > 0 ? existingUsers[0] : null;
};

/**
 * Get user info from Clerk and database
 */
export const getUserInfo = async (userId: string) => {
    if (!userId) {
        throw new Error("User ID is required");
    }

    // Get from Clerk
    const clerkUser = await getClerkUserById(userId);

    // Get from database
    const dbUser = await checkUserExists(userId);

    return {
        clerk: clerkUser,
        database: dbUser,
    };
};

