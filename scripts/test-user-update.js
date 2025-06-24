// Test script to debug user update functionality
async function testUserUpdate() {
    console.log("🧪 TESTING USER UPDATE FUNCTIONALITY\n");

    const baseUrl = "http://localhost:3001";

    // Test 1: Get a user to test with
    console.log("1️⃣ Getting user list:");
    try {
        const response = await fetch(`${baseUrl}/api/admin-users`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
            console.log("   ⚠️  Unauthorized - need to be logged in as admin");
            console.log("   💡 Please log in to the admin interface first");
            return;
        }
        
        if (!response.ok) {
            console.log(`   ❌ Failed to get users: ${response.status}`);
            return;
        }

        const users = await response.json();
        console.log(`   ✅ Found ${users.length} users`);
        
        if (users.length === 0) {
            console.log("   ⚠️  No users found to test with");
            return;
        }

        const testUser = users[0];
        console.log(`   📝 Testing with user: ${testUser.userName} (ID: ${testUser.id})`);
        console.log(`   📝 Current status: ${testUser.status}`);

        // Test 2: Try to update the user status
        console.log("\n2️⃣ Testing user update:");
        const newStatus = testUser.status === 'active' ? 'blocked' : 'active';
        console.log(`   🔄 Changing status from '${testUser.status}' to '${newStatus}'`);

        const updateData = {
            status: newStatus,
            userName: testUser.userName,
            email: testUser.email,
            role: testUser.role || 'user'
        };

        console.log("   📝 Update payload:", JSON.stringify(updateData, null, 2));

        const updateResponse = await fetch(`${baseUrl}/api/admin-users/${testUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updateData)
        });

        console.log(`   📡 PUT Response: ${updateResponse.status} ${updateResponse.statusText}`);

        if (updateResponse.ok) {
            const updatedUser = await updateResponse.json();
            console.log("   ✅ Update successful!");
            console.log(`   📝 New status: ${updatedUser.status}`);
            console.log(`   📝 Updated at: ${updatedUser.updatedAt}`);
        } else {
            const errorText = await updateResponse.text();
            console.log("   ❌ Update failed!");
            console.log(`   📝 Error: ${errorText}`);
        }

        // Test 3: Verify the update by getting the user again
        console.log("\n3️⃣ Verifying update:");
        const verifyResponse = await fetch(`${baseUrl}/api/admin-users/${testUser.id}`);
        
        if (verifyResponse.ok) {
            const verifiedUser = await verifyResponse.json();
            console.log(`   📝 Current status: ${verifiedUser.status}`);
            console.log(`   📝 Last updated: ${verifiedUser.updatedAt}`);
            
            if (verifiedUser.status === newStatus) {
                console.log("   ✅ Update verified successfully!");
            } else {
                console.log("   ❌ Update not persisted - status didn't change");
            }
        } else {
            console.log("   ❌ Failed to verify update");
        }

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n📋 DEBUGGING TIPS:");
    console.log("   • Check browser dev tools Network tab for API requests");
    console.log("   • Look for error messages in browser console");
    console.log("   • Verify admin authentication is working");
    console.log("   • Check if React Admin is sending correct data format");
}

testUserUpdate();
