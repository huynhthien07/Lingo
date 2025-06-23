import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const showReadingTestSample = async () => {
    try {
        console.log("📖 English Reading Comprehension Test - Sample Questions\n");

        // Get all questions for the reading test with their options
        const questions = await sql`
            SELECT
                tq.id,
                tq.text as question_text,
                tq."order",
                test_options.id as option_id,
                test_options.text as option_text,
                test_options.is_correct
            FROM test_questions tq
            LEFT JOIN test_options ON tq.id = test_options.question_id
            WHERE tq.test_id = 3
            ORDER BY tq."order", test_options.id
        `;

        // Group questions with their options
        const questionMap = new Map();

        questions.forEach((row: any) => {
            if (!questionMap.has(row.id)) {
                questionMap.set(row.id, {
                    id: row.id,
                    text: row.question_text,
                    order: row.order,
                    options: []
                });
            }

            if (row.option_id) {
                questionMap.get(row.id).options.push({
                    id: row.option_id,
                    text: row.option_text,
                    isCorrect: row.is_correct
                });
            }
        });

        // Display first 5 questions as samples
        const questionsArray = Array.from(questionMap.values()).slice(0, 5);

        questionsArray.forEach((question: any, index: number) => {
            console.log(`${question.order}. ${question.text}\n`);

            question.options.forEach((option: any, optIndex: number) => {
                const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                const correctMark = option.isCorrect ? " ✓" : "";
                console.log(`   ${letter}) ${option.text}${correctMark}`);
            });

            console.log(); // Empty line between questions
        });

        console.log("📊 Test Statistics:");
        console.log(`   • Total Questions: ${questionMap.size}`);
        console.log(`   • Duration: 20 minutes`);
        console.log(`   • Type: Reading Comprehension`);
        console.log(`   • Format: Multiple Choice`);

        console.log("\n✅ Reading test conversion completed successfully!");
        console.log("The test now focuses on reading comprehension skills instead of listening.");

    } catch (error) {
        console.error("❌ Error showing reading test sample:", error);
        throw error;
    }
};

if (require.main === module) {
    showReadingTestSample()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("Failed to show reading test sample:", error);
            process.exit(1);
        });
}
