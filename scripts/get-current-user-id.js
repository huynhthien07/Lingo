// Get current user ID from the database
async function getCurrentUserId() {
    console.log("🔍 GETTING CURRENT USER ID\n");

    const baseUrl = "http://localhost:3001";

    try {
        // Check if we can get user info from the login endpoint
        console.log("1️⃣ Checking login endpoint...");
        const response = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'GET'
        });
        
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("   📝 User data:", JSON.stringify(data, null, 2));
            
            if (data.user && data.user.userId) {
                console.log(`   ✅ Current user ID: ${data.user.userId}`);
                console.log("\n📋 TO FIX THE ADMIN ISSUE:");
                console.log(`   1. Add "${data.user.userId}" to the adminIds array in lib/admin.ts`);
                console.log("   2. Restart the application");
                console.log("   3. Try accessing User Management again");
            }
        } else {
            console.log("   ❌ Failed to get user info");
            const errorText = await response.text();
            console.log(`   📝 Error: ${errorText}`);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

getCurrentUserId();
