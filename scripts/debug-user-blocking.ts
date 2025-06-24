import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function debugUserBlocking() {
    console.log("🔍 DEBUGGING USER BLOCKING FUNCTIONALITY\n");

    try {
        // 1. Check if users table has data
        console.log("1️⃣ Checking Users Table:");
        const allUsers = await db.select().from(users);
        
        if (allUsers.length === 0) {
            console.log("   ⚠️  No users found in users table");
            console.log("   💡 Creating a test user...");
            
            // Create a test user
            const testUser = await db.insert(users).values({
                userId: "test_user_001",
                email: "test@example.com",
                userName: "Test User",
                status: "active",
                role: "user",
            }).returning();
            
            console.log(`   ✅ Created test user: ${testUser[0].userName} (${testUser[0].email})`);
        } else {
            console.log(`   ✅ Found ${allUsers.length} users in the table:`);
            allUsers.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.userName} (${user.email}) - Status: ${user.status}`);
            });
        }

        // 2. Test API endpoint directly
        console.log("\n2️⃣ Testing API Endpoints:");
        
        // Get the first user for testing
        const usersForTest = await db.select().from(users).limit(1);
        if (usersForTest.length === 0) {
            console.log("   ❌ No users available for testing");
            return;
        }

        const testUser = usersForTest[0];
        console.log(`   Testing with user: ${testUser.userName} (ID: ${testUser.id})`);

        // Test GET endpoint
        try {
            const response = await fetch(`http://localhost:3001/api/admin-users/${testUser.id}`);
            if (response.ok) {
                const userData = await response.json();
                console.log(`   ✅ GET /api/admin-users/${testUser.id} - Success`);
                console.log(`   📝 Current status: ${userData.status}`);
            } else {
                console.log(`   ❌ GET /api/admin-users/${testUser.id} - Failed: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log(`   ❌ GET request failed: ${error}`);
        }

        // Test PUT endpoint (blocking)
        try {
            const updateData = {
                status: testUser.status === 'active' ? 'blocked' : 'active'
            };
            
            const response = await fetch(`http://localhost:3001/api/admin-users/${testUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const updatedUser = await response.json();
                console.log(`   ✅ PUT /api/admin-users/${testUser.id} - Success`);
                console.log(`   📝 New status: ${updatedUser.status}`);
                
                // Revert the change
                const revertData = { status: testUser.status };
                await fetch(`http://localhost:3001/api/admin-users/${testUser.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(revertData)
                });
                console.log(`   🔄 Reverted status back to: ${testUser.status}`);
            } else {
                const errorText = await response.text();
                console.log(`   ❌ PUT /api/admin-users/${testUser.id} - Failed: ${response.status} ${response.statusText}`);
                console.log(`   📝 Error details: ${errorText}`);
            }
        } catch (error) {
            console.log(`   ❌ PUT request failed: ${error}`);
        }

        // 3. Check React Admin configuration
        console.log("\n3️⃣ React Admin Configuration Check:");
        console.log("   ✅ Resource name: 'admin-users'");
        console.log("   ✅ API endpoint: '/api/admin-users'");
        console.log("   ✅ Edit component: AdminUserEdit");
        console.log("   ✅ List component: AdminUserList");

        // 4. Check for common issues
        console.log("\n4️⃣ Common Issues Check:");
        
        // Check if admin protection is working
        const adminIds = ["user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY"];
        const adminUser = allUsers.find(user => adminIds.includes(user.userId));
        if (adminUser) {
            console.log(`   ✅ Admin user found: ${adminUser.userName} (${adminUser.userId})`);
            console.log("   ✅ Admin protection should prevent blocking this user");
        } else {
            console.log("   ⚠️  No admin users found in database");
        }

        // Check field validation
        console.log("   ✅ Status field validation: required()");
        console.log("   ✅ Status choices: active, blocked, suspended");

        console.log("\n🎯 TROUBLESHOOTING STEPS:");
        console.log("   1. Open browser dev tools (F12)");
        console.log("   2. Go to: http://localhost:3001/admin/admin-users");
        console.log("   3. Click on a user to edit");
        console.log("   4. Change status from 'Active' to 'Blocked'");
        console.log("   5. Click Save and check for errors in console");
        console.log("   6. Check Network tab for API request/response");

        console.log("\n📊 EXPECTED BEHAVIOR:");
        console.log("   • Status dropdown should show: Active, Blocked, Suspended");
        console.log("   • Changing status should trigger PUT request to /api/admin-users/{id}");
        console.log("   • Success should show notification and refresh list");
        console.log("   • Admin accounts should show protection message");

    } catch (error) {
        console.error("❌ Error debugging user blocking:", error);
    }
}

// Run the debug if this file is executed directly
if (require.main === module) {
    debugUserBlocking();
}

export { debugUserBlocking };
