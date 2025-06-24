// Test admin-users API directly
async function testAdminUsersAPI() {
    console.log("🧪 TESTING ADMIN-USERS API DIRECTLY\n");

    const baseUrl = "http://localhost:3001";

    try {
        // Test 1: Check if admin-users endpoint exists
        console.log("1️⃣ Testing GET /api/admin-users...");
        const response = await fetch(`${baseUrl}/api/admin-users`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
            console.log("   ⚠️  Unauthorized - need to be logged in as admin");
            console.log("   💡 This is expected when not authenticated");
        } else if (response.ok) {
            const users = await response.json();
            console.log(`   ✅ Success! Found ${users.length} users`);
            
            if (users.length > 0) {
                const testUser = users[0];
                console.log(`   📝 First user: ${testUser.userName} (ID: ${testUser.id}, Status: ${testUser.status})`);
                
                // Test 2: Try to get individual user
                console.log("\n2️⃣ Testing GET /api/admin-users/{id}...");
                const userResponse = await fetch(`${baseUrl}/api/admin-users/${testUser.id}`);
                console.log(`   Status: ${userResponse.status} ${userResponse.statusText}`);
                
                if (userResponse.ok) {
                    const userData = await userResponse.json();
                    console.log(`   ✅ Individual user fetch successful`);
                    console.log(`   📝 User data: ${userData.userName} - ${userData.status}`);
                } else {
                    console.log(`   ❌ Individual user fetch failed`);
                }
                
                // Test 3: Try to update user (this will test the blocking functionality)
                console.log("\n3️⃣ Testing PUT /api/admin-users/{id} (blocking test)...");
                const newStatus = testUser.status === 'active' ? 'blocked' : 'active';
                const updateData = {
                    status: newStatus
                };
                
                const updateResponse = await fetch(`${baseUrl}/api/admin-users/${testUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updateData)
                });
                
                console.log(`   Status: ${updateResponse.status} ${updateResponse.statusText}`);
                
                if (updateResponse.ok) {
                    const updatedUser = await updateResponse.json();
                    console.log(`   ✅ Update successful!`);
                    console.log(`   📝 Status changed from '${testUser.status}' to '${updatedUser.status}'`);
                    
                    // Revert the change
                    console.log("\n4️⃣ Reverting the change...");
                    const revertData = { status: testUser.status };
                    const revertResponse = await fetch(`${baseUrl}/api/admin-users/${testUser.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(revertData)
                    });
                    
                    if (revertResponse.ok) {
                        console.log(`   ✅ Reverted status back to '${testUser.status}'`);
                    } else {
                        console.log(`   ⚠️  Failed to revert status`);
                    }
                } else {
                    const errorText = await updateResponse.text();
                    console.log(`   ❌ Update failed: ${errorText}`);
                }
            }
        } else {
            console.log(`   ❌ Unexpected status: ${response.status}`);
            const errorText = await response.text();
            console.log(`   📝 Error: ${errorText}`);
        }

        console.log("\n📋 DIAGNOSIS:");
        if (response.status === 401) {
            console.log("   • API endpoint exists but requires authentication");
            console.log("   • User needs to be logged in as admin to access");
            console.log("   • Check if current user is in admin list (lib/admin.ts)");
        } else if (response.status === 404) {
            console.log("   • API endpoint not found");
            console.log("   • Check if admin-users route exists");
            console.log("   • Verify React Admin resource configuration");
        } else if (response.ok) {
            console.log("   • API endpoint is working correctly");
            console.log("   • User has admin access");
            console.log("   • Blocking functionality should work in UI");
        }

    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        console.log("   💡 Make sure the application is running on localhost:3001");
    }

    console.log("\n🎯 NEXT STEPS:");
    console.log("   1. If API works: Check React Admin UI configuration");
    console.log("   2. If 401 error: Add current user to admin list");
    console.log("   3. If 404 error: Check API route files");
    console.log("   4. Test blocking in browser: http://localhost:3001/admin");
}

testAdminUsersAPI();
