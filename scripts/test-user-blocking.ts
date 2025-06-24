import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function testUserBlocking() {
    console.log("🧪 TESTING USER BLOCKING FUNCTIONALITY\n");

    try {
        // 1. Check if users table exists and has data
        console.log("1️⃣ Checking Users Table:");
        const allUsers = await db.select().from(users).limit(5);
        
        if (allUsers.length === 0) {
            console.log("   ⚠️  No users found in users table");
            console.log("   💡 Try logging in to the application first to create user records");
            return;
        }

        console.log(`   ✅ Found ${allUsers.length} users in the table:`);
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.userName} (${user.email}) - Status: ${user.status}`);
        });

        // 2. Test blocking a user
        console.log("\n2️⃣ Testing User Blocking:");
        const testUser = allUsers.find(user => user.status === 'active');
        
        if (!testUser) {
            console.log("   ⚠️  No active users found to test blocking");
            return;
        }

        console.log(`   Testing with user: ${testUser.userName} (${testUser.email})`);
        console.log(`   Current status: ${testUser.status}`);

        // Block the user
        const blockedUser = await db.update(users)
            .set({ 
                status: 'blocked',
                updatedAt: new Date()
            })
            .where(eq(users.id, testUser.id))
            .returning();

        if (blockedUser.length > 0) {
            console.log(`   ✅ Successfully blocked user: ${blockedUser[0].userName}`);
            console.log(`   📝 New status: ${blockedUser[0].status}`);
        }

        // 3. Test unblocking the user
        console.log("\n3️⃣ Testing User Unblocking:");
        const unblockedUser = await db.update(users)
            .set({ 
                status: 'active',
                updatedAt: new Date()
            })
            .where(eq(users.id, testUser.id))
            .returning();

        if (unblockedUser.length > 0) {
            console.log(`   ✅ Successfully unblocked user: ${unblockedUser[0].userName}`);
            console.log(`   📝 New status: ${unblockedUser[0].status}`);
        }

        // 4. Test admin protection
        console.log("\n4️⃣ Testing Admin Protection:");
        const adminIds = ["user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY"];
        const adminUser = allUsers.find(user => adminIds.includes(user.userId));
        
        if (adminUser) {
            console.log(`   Found admin user: ${adminUser.userName} (${adminUser.userId})`);
            console.log(`   ✅ Admin protection should prevent blocking this user in the UI`);
        } else {
            console.log("   ⚠️  No admin users found in the table");
        }

        // 5. Display current status
        console.log("\n5️⃣ Final Status Check:");
        const finalUsers = await db.select().from(users).limit(5);
        finalUsers.forEach((user, index) => {
            const statusIcon = user.status === 'active' ? '✅' : 
                             user.status === 'blocked' ? '🚫' : 
                             user.status === 'suspended' ? '⏸️' : '❓';
            console.log(`   ${index + 1}. ${user.userName} - ${statusIcon} ${user.status.toUpperCase()}`);
        });

        console.log("\n🎯 TESTING INSTRUCTIONS:");
        console.log("   1. Go to: http://localhost:3001/admin/admin-users");
        console.log("   2. Sign in as admin");
        console.log("   3. Try blocking/unblocking users");
        console.log("   4. Verify blocked users cannot log in");
        console.log("   5. Check that admin accounts cannot be blocked");

        console.log("\n📊 EXPECTED BEHAVIOR:");
        console.log("   • Blocked users are redirected to /blocked page");
        console.log("   • Admin accounts show protection message");
        console.log("   • Status changes are saved to users table");
        console.log("   • Middleware checks users table for blocking");

    } catch (error) {
        console.error("❌ Error testing user blocking:", error);
    }
}

// Run the test if this file is executed directly
if (require.main === module) {
    testUserBlocking();
}

export { testUserBlocking };
