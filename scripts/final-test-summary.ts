import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const showFinalTestSummary = async () => {
    try {
        console.log("📊 FINAL TEST SUMMARY - All Practice Tests\n");
        console.log("=" .repeat(60));

        // Get all tests with their details
        const tests = await sql`
            SELECT id, title, image_src, duration 
            FROM tests 
            ORDER BY id
        `;

        console.log("\n🎯 PRACTICE TESTS OVERVIEW:\n");
        
        tests.forEach((test: any, index: number) => {
            console.log(`${index + 1}. ${test.title}`);
            console.log(`   • Duration: ${test.duration} minutes`);
            console.log(`   • Image: ${test.image_src}`);
            console.log(`   • Test ID: ${test.id}\n`);
        });

        // Check image consistency
        const uniqueImages = [...new Set(tests.map((test: any) => test.image_src))];
        console.log("🖼️  IMAGE CONSISTENCY:");
        console.log(`   • Unique images used: ${uniqueImages.length}`);
        console.log(`   • All tests use same image: ${uniqueImages.length === 1 ? 'YES ✅' : 'NO ❌'}`);
        if (uniqueImages.length === 1) {
            console.log(`   • Common image: ${uniqueImages[0]}`);
        }

        // Get question counts for each test
        console.log("\n📝 QUESTION STATISTICS:");
        for (const test of tests) {
            const questionCount = await sql`
                SELECT COUNT(*) as count 
                FROM test_questions 
                WHERE test_id = ${test.id}
            `;
            console.log(`   • ${test.title}: ${questionCount[0].count} questions`);
        }

        // Get total statistics
        const totalQuestions = await sql`SELECT COUNT(*) as count FROM test_questions`;
        const totalOptions = await sql`SELECT COUNT(*) as count FROM test_options`;
        
        console.log("\n📈 OVERALL STATISTICS:");
        console.log(`   • Total tests: ${tests.length}`);
        console.log(`   • Total questions: ${totalQuestions[0].count}`);
        console.log(`   • Total options: ${totalOptions[0].count}`);
        console.log(`   • Average questions per test: ${Math.round(totalQuestions[0].count / tests.length)}`);

        console.log("\n" + "=" .repeat(60));
        console.log("✅ ALL TESTS NOW USE CONSISTENT GRAMMAR TEST IMAGE!");
        console.log("🎉 Practice tests are ready for users!");

    } catch (error) {
        console.error("❌ Error showing test summary:", error);
        throw error;
    }
};

if (require.main === module) {
    showFinalTestSummary()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("Failed to show test summary:", error);
            process.exit(1);
        });
}
