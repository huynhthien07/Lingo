import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function createSampleUsers() {
    console.log("🚀 Creating sample users...");

    try {
        // Create sample users
        const sampleUsers = [
            {
                userId: "user_sample_001",
                email: "john.doe@example.com",
                userName: "John Doe",
                userImageSrc: "/mascot.svg",
                status: "active",
                role: "user",
                firstName: "John",
                lastName: "Doe",
                phoneNumber: "+1-555-0123",
                country: "United States",
                language: "en",
                timezone: "America/New_York",
            },
            {
                userId: "user_sample_002",
                email: "jane.smith@example.com",
                userName: "Jane Smith",
                userImageSrc: "/mascot.svg",
                status: "active",
                role: "premium",
                firstName: "Jane",
                lastName: "Smith",
                phoneNumber: "+1-555-0456",
                country: "Canada",
                language: "en",
                timezone: "America/Toronto",
            },
            {
                userId: "user_sample_003",
                email: "carlos.rodriguez@example.com",
                userName: "Carlos Rodriguez",
                userImageSrc: "/mascot.svg",
                status: "blocked",
                role: "user",
                firstName: "Carlos",
                lastName: "Rodriguez",
                phoneNumber: "+34-123-456-789",
                country: "Spain",
                language: "es",
                timezone: "Europe/Madrid",
            },
            {
                userId: "user_sample_004",
                email: "marie.dubois@example.com",
                userName: "Marie Dubois",
                userImageSrc: "/mascot.svg",
                status: "suspended",
                role: "user",
                firstName: "Marie",
                lastName: "Dubois",
                phoneNumber: "+33-1-23-45-67-89",
                country: "France",
                language: "fr",
                timezone: "Europe/Paris",
            },
            {
                userId: "user_sample_005",
                email: "admin@lingo.com",
                userName: "Admin User",
                userImageSrc: "/mascot.svg",
                status: "active",
                role: "premium",
                firstName: "Admin",
                lastName: "User",
                phoneNumber: "+1-555-0000",
                country: "United States",
                language: "en",
                timezone: "America/New_York",
            }
        ];

        for (const user of sampleUsers) {
            try {
                const result = await db.insert(users).values(user).returning();
                console.log(`✅ Created user: ${user.userName} (${user.email})`);
            } catch (error) {
                if (error instanceof Error && error.message.includes('duplicate key')) {
                    console.log(`⚠️  User already exists: ${user.userName} (${user.email})`);
                } else {
                    console.error(`❌ Error creating user ${user.userName}:`, error);
                }
            }
        }

        console.log("🎉 Sample users creation completed!");

        // Display current users
        console.log("\n📋 Current users in database:");
        const allUsers = await db.select().from(users);
        allUsers.forEach(user => {
            console.log(`   - ${user.userName} (${user.email}) - Status: ${user.status}, Role: ${user.role}`);
        });

    } catch (error) {
        console.error("❌ Error creating sample users:", error);
    }
}

createSampleUsers();
