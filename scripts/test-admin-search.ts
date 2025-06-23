import "dotenv/config";

const BASE_URL = "http://localhost:3000";

const testAdminSearch = async () => {
    console.log("🔍 Testing Admin Search Functionality...\n");

    try {
        // Test 1: Courses search
        console.log("1. Testing Courses Search:");

        // Test without search
        let response = await fetch(`${BASE_URL}/api/courses`);
        if (response.ok) {
            const allCourses = await response.json();
            console.log(`   ✅ All courses: ${allCourses.length} found`);

            if (allCourses.length > 0) {
                // Test with search
                const searchTerm = allCourses[0].title.substring(0, 3);
                response = await fetch(`${BASE_URL}/api/courses?title=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    console.log(`   ✅ Search for "${searchTerm}": ${searchResults.length} results`);
                } else {
                    console.log(`   ❌ Search failed: ${response.status}`);
                }
            }
        } else {
            console.log(`   ❌ Failed to fetch courses: ${response.status}`);
        }

        // Test 2: Units search
        console.log("\n2. Testing Units Search:");
        response = await fetch(`${BASE_URL}/api/units`);
        if (response.ok) {
            const allUnits = await response.json();
            console.log(`   ✅ All units: ${allUnits.length} found`);

            if (allUnits.length > 0) {
                // Test with title search
                const searchTerm = allUnits[0].title.substring(0, 3);
                response = await fetch(`${BASE_URL}/api/units?title=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    console.log(`   ✅ Search for "${searchTerm}": ${searchResults.length} results`);
                } else {
                    console.log(`   ❌ Search failed: ${response.status}`);
                }

                // Test with course filter
                const courseId = allUnits[0].courseId;
                response = await fetch(`${BASE_URL}/api/units?courseId=${courseId}`);
                if (response.ok) {
                    const filterResults = await response.json();
                    console.log(`   ✅ Filter by course ${courseId}: ${filterResults.length} results`);
                } else {
                    console.log(`   ❌ Course filter failed: ${response.status}`);
                }
            }
        } else {
            console.log(`   ❌ Failed to fetch units: ${response.status}`);
        }

        // Test 3: Lessons search
        console.log("\n3. Testing Lessons Search:");
        response = await fetch(`${BASE_URL}/api/lessons`);
        if (response.ok) {
            const allLessons = await response.json();
            console.log(`   ✅ All lessons: ${allLessons.length} found`);

            if (allLessons.length > 0) {
                // Test with title search
                const searchTerm = allLessons[0].title.substring(0, 3);
                response = await fetch(`${BASE_URL}/api/lessons?title=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    console.log(`   ✅ Search for "${searchTerm}": ${searchResults.length} results`);
                } else {
                    console.log(`   ❌ Search failed: ${response.status}`);
                }
            }
        } else {
            console.log(`   ❌ Failed to fetch lessons: ${response.status}`);
        }

        // Test 4: Challenges search
        console.log("\n4. Testing Challenges Search:");
        response = await fetch(`${BASE_URL}/api/challenges`);
        if (response.ok) {
            const allChallenges = await response.json();
            console.log(`   ✅ All challenges: ${allChallenges.length} found`);

            if (allChallenges.length > 0) {
                // Test with question search
                const searchTerm = "the";
                response = await fetch(`${BASE_URL}/api/challenges?question=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    console.log(`   ✅ Search for "${searchTerm}": ${searchResults.length} results`);
                } else {
                    console.log(`   ❌ Search failed: ${response.status}`);
                }

                // Test with type filter
                const challengeType = allChallenges[0].type;
                response = await fetch(`${BASE_URL}/api/challenges?type=${challengeType}`);
                if (response.ok) {
                    const typeResults = await response.json();
                    console.log(`   ✅ Filter by type "${challengeType}": ${typeResults.length} results`);
                } else {
                    console.log(`   ❌ Type filter failed: ${response.status}`);
                }
            }
        } else {
            console.log(`   ❌ Failed to fetch challenges: ${response.status}`);
        }

        // Test 5: Challenge Options search
        console.log("\n5. Testing Challenge Options Search:");
        response = await fetch(`${BASE_URL}/api/challengeOptions`);
        if (response.ok) {
            const allOptions = await response.json();
            console.log(`   ✅ All challenge options: ${allOptions.length} found`);

            if (allOptions.length > 0) {
                // Test with text search
                const searchTerm = "a";
                response = await fetch(`${BASE_URL}/api/challengeOptions?text=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    console.log(`   ✅ Search for "${searchTerm}": ${searchResults.length} results`);
                } else {
                    console.log(`   ❌ Search failed: ${response.status}`);
                }

                // Test with correct filter
                response = await fetch(`${BASE_URL}/api/challengeOptions?correct=true`);
                if (response.ok) {
                    const correctResults = await response.json();
                    console.log(`   ✅ Filter correct answers: ${correctResults.length} results`);
                } else {
                    console.log(`   ❌ Correct filter failed: ${response.status}`);
                }
            }
        } else {
            console.log(`   ❌ Failed to fetch challenge options: ${response.status}`);
        }

        // Test 6: Users search
        console.log("\n6. Testing Users Search:");
        response = await fetch(`${BASE_URL}/api/users`);
        if (response.ok) {
            const allUsers = await response.json();
            console.log(`   ✅ All users: ${allUsers.length} found`);

            if (allUsers.length > 0) {
                // Test with username search
                const searchTerm = allUsers[0].userName ? allUsers[0].userName.substring(0, 2) : "user";
                response = await fetch(`${BASE_URL}/api/users?userName=${encodeURIComponent(searchTerm)}`);
                if (response.ok) {
                    const searchResults = await response.json();
                    console.log(`   ✅ Search for "${searchTerm}": ${searchResults.length} results`);
                } else {
                    console.log(`   ❌ Search failed: ${response.status}`);
                }

                // Test with blocked filter
                response = await fetch(`${BASE_URL}/api/users?blocked=false`);
                if (response.ok) {
                    const activeUsers = await response.json();
                    console.log(`   ✅ Filter active users: ${activeUsers.length} results`);
                } else {
                    console.log(`   ❌ Blocked filter failed: ${response.status}`);
                }
            }
        } else {
            console.log(`   ❌ Failed to fetch users: ${response.status}`);
        }

        console.log("\n🎉 Admin search functionality test completed!");

    } catch (error) {
        console.error("❌ Error during testing:", error);
    }
};

// Run the test
testAdminSearch();
