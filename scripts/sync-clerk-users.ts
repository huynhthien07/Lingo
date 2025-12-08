/**
 * Script to sync all users from Clerk to the new database
 *
 * This script will:
 * 1. Fetch all users from Clerk
 * 2. Check if user exists in database
 * 3. Insert new users or update existing ones
 * 4. Preserve userId from Clerk for authentication
 *
 * Usage: npx tsx scripts/sync-clerk-users.ts
 */

// Load environment variables FIRST before any imports
import { config } from "dotenv";
import { resolve } from "path";
import { existsSync } from "fs";

// Try .env.local first, then .env
let envPath = resolve(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
    envPath = resolve(process.cwd(), ".env");
}

console.log(`Loading environment from: ${envPath}`);
config({ path: envPath });

// Verify required environment variables are loaded
if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL not found in environment variables!");
    console.error("Please make sure .env or .env.local exists and contains DATABASE_URL");
    process.exit(1);
}

if (!process.env.CLERK_SECRET_KEY) {
    console.error("❌ CLERK_SECRET_KEY not found in environment variables!");
    console.error("Please make sure .env or .env.local exists and contains CLERK_SECRET_KEY");
    process.exit(1);
}

console.log("✅ Environment variables loaded");
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL?.substring(0, 30)}...`);
console.log(`   CLERK_SECRET_KEY: ${process.env.CLERK_SECRET_KEY?.substring(0, 20)}...\n`);

import { createClerkClient } from "@clerk/backend";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Create Clerk client with explicit secret key
const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY!,
});

// Create database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function syncClerkUsers() {
    console.log("🔄 Starting Clerk users sync...\n");

    try {
        // Fetch all users from Clerk
        console.log("📥 Fetching users from Clerk...");
        const clerkUsers = await clerkClient.users.getUserList({
            limit: 500, // Adjust if you have more users
        });

        console.log(`✅ Found ${clerkUsers.data.length} users in Clerk\n`);

        let insertedCount = 0;
        let updatedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        // Process each user
        for (const clerkUser of clerkUsers.data) {
            try {
                const userId = clerkUser.id;
                const email = clerkUser.emailAddresses[0]?.emailAddress || '';
                const userName = clerkUser.username || email.split('@')[0];
                const firstName = clerkUser.firstName || null;
                const lastName = clerkUser.lastName || null;
                const userImageSrc = clerkUser.imageUrl || '/mascot.svg';
                
                // Get role from publicMetadata, default to STUDENT
                const role = (clerkUser.publicMetadata?.role as string) || 'STUDENT';

                console.log(`Processing: ${userName} (${email})`);

                // Check if user already exists in database
                const existingUsers = await db.select()
                    .from(users)
                    .where(eq(users.userId, userId))
                    .limit(1);

                const existingUser = existingUsers[0];

                if (existingUser) {
                    // Update existing user
                    await db.update(users)
                        .set({
                            email: email,
                            userName: userName,
                            firstName: firstName,
                            lastName: lastName,
                            userImageSrc: userImageSrc,
                            role: role as any,
                            updatedAt: new Date(),
                        })
                        .where(eq(users.userId, userId));

                    console.log(`  ✅ Updated existing user: ${userName}`);
                    updatedCount++;
                } else {
                    // Insert new user
                    await db.insert(users).values({
                        userId: userId,
                        email: email,
                        userName: userName,
                        firstName: firstName,
                        lastName: lastName,
                        userImageSrc: userImageSrc,
                        status: 'active', // Default to active
                        role: role as any,
                        language: 'en', // Default language
                        createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt) : new Date(),
                        updatedAt: new Date(),
                    });

                    console.log(`  ✅ Inserted new user: ${userName}`);
                    insertedCount++;
                }
            } catch (error: any) {
                console.error(`  ❌ Error processing user ${clerkUser.id}:`, error.message);
                errorCount++;
            }
        }

        // Print summary
        console.log("\n" + "=".repeat(50));
        console.log("📊 SYNC SUMMARY");
        console.log("=".repeat(50));
        console.log(`Total users in Clerk: ${clerkUsers.data.length}`);
        console.log(`✅ Inserted: ${insertedCount}`);
        console.log(`🔄 Updated: ${updatedCount}`);
        console.log(`⏭️  Skipped: ${skippedCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log("=".repeat(50));

        if (errorCount === 0) {
            console.log("\n✅ Sync completed successfully!");
        } else {
            console.log("\n⚠️  Sync completed with some errors. Please check the logs above.");
        }

    } catch (error: any) {
        console.error("\n❌ Fatal error during sync:", error);
        process.exit(1);
    }
}

// Run the sync
syncClerkUsers()
    .then(() => {
        console.log("\n👋 Sync script finished.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Unhandled error:", error);
        process.exit(1);
    });

