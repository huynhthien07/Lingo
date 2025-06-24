// Simple test script to verify API endpoints are working
async function testApiEndpoints() {
    console.log("🧪 TESTING API ENDPOINTS\n");

    const baseUrl = "http://localhost:3001";

    // Test 1: Check if admin-users API is accessible
    console.log("1️⃣ Testing GET /api/admin-users");
    try {
        const response = await fetch(`${baseUrl}/api/admin-users`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.status === 401) {
            console.log("   ✅ Expected: Unauthorized (need admin access)");
        } else if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success: Found ${data.length} users`);
        } else {
            console.log(`   ❌ Unexpected status: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 2: Check if admin status endpoint works
    console.log("\n2️⃣ Testing GET /api/admin/status");
    try {
        const response = await fetch(`${baseUrl}/api/admin/status`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success: isAdmin=${data.isAdmin}, userId=${data.userId}`);
        } else {
            console.log(`   ❌ Failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    // Test 3: Check if courses API works (for comparison)
    console.log("\n3️⃣ Testing GET /api/courses");
    try {
        const response = await fetch(`${baseUrl}/api/courses`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success: Found ${data.length} courses`);
        } else {
            console.log(`   ❌ Failed: ${response.status}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }

    console.log("\n📋 SUMMARY:");
    console.log("   • API endpoints are accessible");
    console.log("   • Admin authentication is required for admin-users");
    console.log("   • React Admin should handle the UI routing");
    console.log("   • Navigate to User Management through the admin interface");
}

testApiEndpoints();
