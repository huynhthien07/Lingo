// Simple test to check if search is working
const testSearch = async () => {
    console.log("Testing search functionality...\n");
    
    try {
        // Test basic course fetch
        console.log("1. Testing basic course fetch:");
        let response = await fetch("http://localhost:3000/api/courses");
        console.log(`   Status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   Found ${data.length} courses`);
            
            // Test search
            console.log("\n2. Testing course search:");
            response = await fetch("http://localhost:3000/api/courses?title=English");
            console.log(`   Search status: ${response.status}`);
            
            if (response.ok) {
                const searchData = await response.json();
                console.log(`   Search found ${searchData.length} courses`);
                console.log("   ✅ Search is working!");
            } else {
                console.log("   ❌ Search failed");
            }
        } else {
            console.log("   ❌ Basic fetch failed");
        }
        
    } catch (error) {
        console.error("❌ Error:", error);
    }
};

testSearch();
