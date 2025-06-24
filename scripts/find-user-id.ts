import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function findUserId() {
    console.log("🔍 FINDING USER ID IN DATABASE\n");

    try {
        // Get all users from the database
        console.log("1️⃣ Checking users table...");
        const allUsers = await db.select().from(users);
        
        console.log(`   ✅ Found ${allUsers.length} users in database:`);
        
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.userName} (${user.email})`);
            console.log(`      User ID: ${user.userId}`);
            console.log(`      Status: ${user.status}`);
            console.log(`      Role: ${user.role}`);
            console.log("");
        });

        // Look for the current user (Quách)
        const currentUser = allUsers.find(user => 
            user.email === "22521285@gm.uit.edu.vn" || 
            user.userName.includes("Quách")
        );

        if (currentUser) {
            console.log("🎯 FOUND CURRENT USER:");
            console.log(`   Name: ${currentUser.userName}`);
            console.log(`   Email: ${currentUser.email}`);
            console.log(`   Clerk User ID: ${currentUser.userId}`);
            console.log(`   Status: ${currentUser.status}`);
            
            console.log("\n📋 TO FIX THE ADMIN ISSUE:");
            console.log(`   1. Add "${currentUser.userId}" to the adminIds array in lib/admin.ts`);
            console.log("   2. The array should look like:");
            console.log("      const adminIds = [");
            console.log(`          "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",`);
            console.log(`          "${currentUser.userId}",`);
            console.log("      ]");
            console.log("   3. Restart the application");
            console.log("   4. Try accessing User Management again");
        } else {
            console.log("⚠️  Current user not found in database");
            console.log("   💡 User might not have logged in yet or user tracking is not working");
        }

    } catch (error) {
        console.error("❌ Error finding user ID:", error);
    }
}

findUserId();
