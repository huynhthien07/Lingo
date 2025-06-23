import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const verifyPracticeTests = async () => {
    try {
        console.log("Verifying practice tests data...\n");

        // Get all tests
        const tests = await sql`SELECT * FROM tests ORDER BY id`;
        console.log("📋 Tests in database:");
        tests.forEach((test: any) => {
            console.log(`  - ID: ${test.id}, Title: "${test.title}", Duration: ${test.duration} min`);
        });

        // Get test questions count for each test
        console.log("\n📝 Questions per test:");
        for (const test of tests) {
            const questionCount = await sql`
                SELECT COUNT(*) as count 
                FROM test_questions 
                WHERE test_id = ${test.id}
            `;
            console.log(`  - Test ${test.id} (${test.title}): ${questionCount[0].count} questions`);
        }

        // Get test options count for each test
        console.log("\n🔘 Options per test:");
        for (const test of tests) {
            const optionCount = await sql`
                SELECT COUNT(test_options.*) as count
                FROM test_options
                JOIN test_questions ON test_options.question_id = test_questions.id
                WHERE test_questions.test_id = ${test.id}
            `;
            console.log(`  - Test ${test.id} (${test.title}): ${optionCount[0].count} options`);
        }

        // Show sample questions from the new tests
        console.log("\n📖 Sample questions from new tests:");

        const test2Questions = await sql`
            SELECT * FROM test_questions 
            WHERE test_id = 2 
            ORDER BY "order" 
            LIMIT 3
        `;

        console.log("\n  Vocabulary Test (Test 2) - Sample Questions:");
        test2Questions.forEach((q: any) => {
            console.log(`    ${q.order}. ${q.text}`);
        });

        const test3Questions = await sql`
            SELECT * FROM test_questions 
            WHERE test_id = 3 
            ORDER BY "order" 
            LIMIT 3
        `;

        console.log("\n  Listening Comprehension (Test 3) - Sample Questions:");
        test3Questions.forEach((q: any) => {
            console.log(`    ${q.order}. ${q.text}`);
        });

        console.log("\n✅ Verification completed successfully!");

    } catch (error) {
        console.error("❌ Error verifying practice tests:", error);
        throw error;
    }
};

if (require.main === module) {
    verifyPracticeTests()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("Failed to verify practice tests:", error);
            process.exit(1);
        });
}
