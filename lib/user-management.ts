import { auth, currentUser } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Upserts user information to the users table
 * Creates a new user if they don't exist, or updates existing user with latest login info
 */
export const upsertUserToUsersTable = async () => {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        throw new Error("Unauthorized");
    }

    try {
        // Check if user already exists in users table
        const existingUser = await db.select()
            .from(users)
            .where(eq(users.userId, userId))
            .limit(1);

        const userEmail = user.emailAddresses[0]?.emailAddress || "";
        const userName = user.firstName || user.username || "User";
        const userImageSrc = user.imageUrl || "/mascot.svg";
        const firstName = user.firstName || "";
        const lastName = user.lastName || "";

        if (existingUser.length > 0) {
            // Update existing user with latest login information
            const updatedUser = await db.update(users)
                .set({
                    userName: userName,
                    userImageSrc: userImageSrc,
                    firstName: firstName,
                    lastName: lastName,
                    lastLoginAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(users.userId, userId))
                .returning();

            console.log(`✅ Updated existing user: ${userName} (${userEmail})`);
            return updatedUser[0];
        } else {
            // Create new user
            const newUser = await db.insert(users)
                .values({
                    userId: userId,
                    email: userEmail,
                    userName: userName,
                    userImageSrc: userImageSrc,
                    firstName: firstName,
                    lastName: lastName,
                    status: "active",
                    role: "user",
                    language: "en", // Default language
                    lastLoginAt: new Date(),
                })
                .returning();

            console.log(`✅ Created new user: ${userName} (${userEmail})`);
            return newUser[0];
        }
    } catch (error) {
        console.error("Error upserting user to users table:", error);
        
        // If it's a duplicate key error (race condition), try to get the existing user
        if (error instanceof Error && error.message.includes('duplicate key')) {
            try {
                const existingUser = await db.select()
                    .from(users)
                    .where(eq(users.userId, userId))
                    .limit(1);
                
                if (existingUser.length > 0) {
                    // Update the existing user's last login
                    const updatedUser = await db.update(users)
                        .set({
                            lastLoginAt: new Date(),
                            updatedAt: new Date(),
                        })
                        .where(eq(users.userId, userId))
                        .returning();
                    
                    console.log(`✅ Updated user after duplicate key error: ${userName} (${userEmail})`);
                    return updatedUser[0];
                }
            } catch (retryError) {
                console.error("Error in retry after duplicate key:", retryError);
            }
        }
        
        throw error;
    }
};

/**
 * Gets user information from the users table
 */
export const getUserFromUsersTable = async (userId?: string) => {
    const { userId: authUserId } = await auth();
    const targetUserId = userId || authUserId;

    if (!targetUserId) {
        return null;
    }

    try {
        const user = await db.select()
            .from(users)
            .where(eq(users.userId, targetUserId))
            .limit(1);

        return user.length > 0 ? user[0] : null;
    } catch (error) {
        console.error("Error getting user from users table:", error);
        return null;
    }
};

/**
 * Checks if a user exists in the users table
 */
export const userExistsInUsersTable = async (userId: string) => {
    try {
        const user = await getUserFromUsersTable(userId);
        return user !== null;
    } catch (error) {
        console.error("Error checking if user exists:", error);
        return false;
    }
};
