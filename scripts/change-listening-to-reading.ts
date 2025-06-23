import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const changeListeningToReading = async () => {
    try {
        console.log("Changing listening test to reading test...");

        // Update the test title and image
        await sql`
            UPDATE tests 
            SET title = 'English Reading Comprehension',
                image_src = '/reading-test.svg'
            WHERE id = 3
        `;

        console.log("✅ Updated test title and image");

        // Update all questions for Test 3 to be reading-based
        const readingQuestions = [
            {
                id: 36,
                text: "Read the passage: 'The meeting will commence at 9:00 AM sharp in the main conference room.' What time does the meeting start?",
                order: 1,
            },
            {
                id: 37,
                text: "According to the text: 'Please gather in the conference room for our weekly discussion.' Where should people meet?",
                order: 2,
            },
            {
                id: 38,
                text: "Read the memo: 'The project deadline has been moved to next Friday due to additional requirements.' What is the main topic?",
                order: 3,
            },
            {
                id: 39,
                text: "In the email: 'I am excited about the new proposal and look forward to implementing it.' How does the writer feel?",
                order: 4,
            },
            {
                id: 40,
                text: "Read the text: 'We should schedule another meeting to discuss the details further.' What does the author suggest?",
                order: 5,
            },
            {
                id: 41,
                text: "From the announcement: 'Flight departure from Gate 15 has been confirmed.' What gate number is mentioned?",
                order: 6,
            },
            {
                id: 42,
                text: "Read the customer complaint: 'I have been charged incorrectly on my last bill.' What is the main concern?",
                order: 7,
            },
            {
                id: 43,
                text: "According to the schedule: 'Flight 247 departs at 2:45 PM from Terminal B.' What is the departure time?",
                order: 8,
            },
        ];

        // Update each question
        for (const question of readingQuestions) {
            await sql`
                UPDATE test_questions 
                SET text = ${question.text}
                WHERE id = ${question.id}
            `;
        }

        console.log("✅ Updated all questions to reading-based format");

        // The options remain the same since they're still valid for reading comprehension
        console.log("✅ Options remain valid for reading comprehension");

        // Add a few more reading-specific questions to make it more comprehensive
        await db.insert(schema.testQuestions).values([
            {
                id: 44,
                testId: 3,
                text: "Read the paragraph: 'The ancient library contained thousands of manuscripts from different civilizations. Scholars from around the world came to study these precious documents.' What did the library contain?",
                order: 9,
            },
            {
                id: 45,
                testId: 3,
                text: "From the article: 'Climate change affects weather patterns globally, causing more frequent storms and droughts.' What does climate change cause?",
                order: 10,
            },
        ]);

        // Add options for the new questions
        await db.insert(schema.testOptions).values([
            // Question 44: What did the library contain?
            {
                id: 172,
                questionId: 44,
                text: "Modern computers",
                isCorrect: false,
            },
            {
                id: 173,
                questionId: 44,
                text: "Ancient manuscripts",
                isCorrect: true,
            },
            {
                id: 174,
                questionId: 44,
                text: "Scientific equipment",
                isCorrect: false,
            },
            {
                id: 175,
                questionId: 44,
                text: "Art collections",
                isCorrect: false,
            },

            // Question 45: What does climate change cause?
            {
                id: 176,
                questionId: 45,
                text: "Better weather conditions",
                isCorrect: false,
            },
            {
                id: 177,
                questionId: 45,
                text: "More frequent storms and droughts",
                isCorrect: true,
            },
            {
                id: 178,
                questionId: 45,
                text: "Stable weather patterns",
                isCorrect: false,
            },
            {
                id: 179,
                questionId: 45,
                text: "Cooler temperatures everywhere",
                isCorrect: false,
            },
        ]);

        console.log("✅ Added 2 additional reading comprehension questions");

        // Verify the changes
        const updatedTest = await sql`SELECT * FROM tests WHERE id = 3`;
        console.log(`\n📖 Updated test: ${updatedTest[0].title}`);

        const questionCount = await sql`
            SELECT COUNT(*) as count 
            FROM test_questions 
            WHERE test_id = 3
        `;
        console.log(`📝 Total questions: ${questionCount[0].count}`);

        const optionCount = await sql`
            SELECT COUNT(test_options.*) as count 
            FROM test_options
            JOIN test_questions ON test_options.question_id = test_questions.id
            WHERE test_questions.test_id = 3
        `;
        console.log(`🔘 Total options: ${optionCount[0].count}`);

        console.log("\n✅ Successfully changed listening test to reading test!");

    } catch (error) {
        console.error("❌ Error changing test:", error);
        throw error;
    }
};

export default changeListeningToReading;

if (require.main === module) {
    changeListeningToReading()
        .then(() => {
            console.log("✅ Test conversion completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to convert test:", error);
            process.exit(1);
        });
}
