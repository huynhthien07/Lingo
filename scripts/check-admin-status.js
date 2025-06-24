// Check admin status
async function checkAdminStatus() {
    console.log("🔍 CHECKING ADMIN STATUS\n");

    const baseUrl = "http://localhost:3001";

    try {
        console.log("1️⃣ Checking admin status endpoint...");
        const response = await fetch(`${baseUrl}/api/admin/status`);
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log("   📝 Admin status data:", JSON.stringify(data, null, 2));
            
            if (data.isAdmin) {
                console.log("   ✅ Current user IS an admin");
                
                // Test admin-users endpoint
                console.log("\n2️⃣ Testing admin-users endpoint...");
                const usersResponse = await fetch(`${baseUrl}/api/admin-users`);
                console.log(`   Status: ${usersResponse.status} ${usersResponse.statusText}`);
                
                if (usersResponse.ok) {
                    const users = await usersResponse.json();
                    console.log(`   ✅ Successfully retrieved ${users.length} users`);
                    
                    if (users.length > 0) {
                        console.log("   📝 First user:", JSON.stringify(users[0], null, 2));
                    }
                } else {
                    const errorText = await usersResponse.text();
                    console.log("   ❌ Failed to get users:", errorText);
                }
            } else {
                console.log("   ❌ Current user is NOT an admin");
                console.log("   💡 Need to add user to admin list in lib/admin.ts");
                if (data.userId) {
                    console.log(`   📝 Current user ID: ${data.userId}`);
                    console.log("   📝 Add this ID to adminIds array in lib/admin.ts");
                }
            }
        } else {
            console.log("   ❌ Failed to check admin status");
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

checkAdminStatus();
