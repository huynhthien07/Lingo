// Simple test script to check statistics API endpoints
const BASE_URL = 'http://localhost:3001';

async function testEndpoint(endpoint, name) {
    try {
        console.log(`\n🧪 Testing ${name}...`);
        const response = await fetch(`${BASE_URL}${endpoint}`);
        
        if (!response.ok) {
            console.log(`❌ ${name} failed with status: ${response.status}`);
            const text = await response.text();
            console.log(`Response: ${text}`);
            return false;
        }
        
        const data = await response.json();
        console.log(`✅ ${name} successful:`);
        console.log(JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.log(`❌ ${name} failed with error: ${error.message}`);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Statistics API Tests...');
    
    const tests = [
        ['/api/analytics/users', 'User Statistics'],
        ['/api/analytics/lessons', 'Lesson Statistics'],
        ['/api/analytics/subscriptions', 'Subscription Statistics'],
        ['/api/analytics/overview', 'Overall Statistics']
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const [endpoint, name] of tests) {
        const success = await testEndpoint(endpoint, name);
        if (success) passed++;
    }
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All tests passed! Statistics API is working correctly.');
    } else {
        console.log('⚠️  Some tests failed. Check the output above for details.');
    }
}

// Run the tests
runTests().catch(console.error);
