import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const addPracticeTests = async () => {
    try {
        console.log("Adding 2 new practice tests...");

        // Add 2 new tests
        await db.insert(schema.tests).values([
            {
                id: 2,
                title: "English Vocabulary Test",
                imageSrc: "/vocabulary-test.svg",
                duration: 25, // 25 minutes
                createdAt: new Date(),
            },
            {
                id: 3,
                title: "English Listening Comprehension",
                imageSrc: "/listening-test.svg",
                duration: 20, // 20 minutes
                createdAt: new Date(),
            },
        ]);

        console.log("Added 2 new tests successfully!");

        // Add questions for Test 2 (Vocabulary Test)
        await db.insert(schema.testQuestions).values([
            // Test 2 Questions
            {
                id: 26,
                testId: 2,
                text: "What is the meaning of 'abundant'?",
                order: 1,
            },
            {
                id: 27,
                testId: 2,
                text: "Choose the synonym for 'difficult':",
                order: 2,
            },
            {
                id: 28,
                testId: 2,
                text: "What does 'procrastinate' mean?",
                order: 3,
            },
            {
                id: 29,
                testId: 2,
                text: "Which word means 'very small'?",
                order: 4,
            },
            {
                id: 30,
                testId: 2,
                text: "What is the opposite of 'ancient'?",
                order: 5,
            },
            {
                id: 31,
                testId: 2,
                text: "Choose the correct meaning of 'meticulous':",
                order: 6,
            },
            {
                id: 32,
                testId: 2,
                text: "What does 'eloquent' mean?",
                order: 7,
            },
            {
                id: 33,
                testId: 2,
                text: "Which word means 'to make worse'?",
                order: 8,
            },
            {
                id: 34,
                testId: 2,
                text: "What is a synonym for 'brave'?",
                order: 9,
            },
            {
                id: 35,
                testId: 2,
                text: "Choose the meaning of 'ambiguous':",
                order: 10,
            },
        ]);

        // Add questions for Test 3 (Listening Comprehension)
        await db.insert(schema.testQuestions).values([
            // Test 3 Questions
            {
                id: 36,
                testId: 3,
                text: "Listen to the conversation. What time does the meeting start?",
                order: 1,
            },
            {
                id: 37,
                testId: 3,
                text: "In the dialogue, where are the speakers planning to meet?",
                order: 2,
            },
            {
                id: 38,
                testId: 3,
                text: "What is the main topic of the conversation?",
                order: 3,
            },
            {
                id: 39,
                testId: 3,
                text: "How does the woman feel about the proposal?",
                order: 4,
            },
            {
                id: 40,
                testId: 3,
                text: "What does the man suggest they should do next?",
                order: 5,
            },
            {
                id: 41,
                testId: 3,
                text: "Listen to the announcement. What gate number is mentioned?",
                order: 6,
            },
            {
                id: 42,
                testId: 3,
                text: "In the phone conversation, what is the caller's main concern?",
                order: 7,
            },
            {
                id: 43,
                testId: 3,
                text: "What time is the flight departure according to the announcement?",
                order: 8,
            },
        ]);

        console.log("Added questions for both tests successfully!");

        // Add options for Test 2 (Vocabulary Test)
        await db.insert(schema.testOptions).values([
            // Question 26: What is the meaning of 'abundant'?
            {
                id: 100,
                questionId: 26,
                text: "Scarce",
                isCorrect: false,
            },
            {
                id: 101,
                questionId: 26,
                text: "Plentiful",
                isCorrect: true,
            },
            {
                id: 102,
                questionId: 26,
                text: "Expensive",
                isCorrect: false,
            },
            {
                id: 103,
                questionId: 26,
                text: "Difficult",
                isCorrect: false,
            },

            // Question 27: Choose the synonym for 'difficult':
            {
                id: 104,
                questionId: 27,
                text: "Easy",
                isCorrect: false,
            },
            {
                id: 105,
                questionId: 27,
                text: "Challenging",
                isCorrect: true,
            },
            {
                id: 106,
                questionId: 27,
                text: "Simple",
                isCorrect: false,
            },
            {
                id: 107,
                questionId: 27,
                text: "Quick",
                isCorrect: false,
            },

            // Question 28: What does 'procrastinate' mean?
            {
                id: 108,
                questionId: 28,
                text: "To delay or postpone",
                isCorrect: true,
            },
            {
                id: 109,
                questionId: 28,
                text: "To work quickly",
                isCorrect: false,
            },
            {
                id: 110,
                questionId: 28,
                text: "To finish early",
                isCorrect: false,
            },
            {
                id: 111,
                questionId: 28,
                text: "To organize",
                isCorrect: false,
            },

            // Question 29: Which word means 'very small'?
            {
                id: 112,
                questionId: 29,
                text: "Enormous",
                isCorrect: false,
            },
            {
                id: 113,
                questionId: 29,
                text: "Tiny",
                isCorrect: true,
            },
            {
                id: 114,
                questionId: 29,
                text: "Average",
                isCorrect: false,
            },
            {
                id: 115,
                questionId: 29,
                text: "Huge",
                isCorrect: false,
            },

            // Question 30: What is the opposite of 'ancient'?
            {
                id: 116,
                questionId: 30,
                text: "Old",
                isCorrect: false,
            },
            {
                id: 117,
                questionId: 30,
                text: "Modern",
                isCorrect: true,
            },
            {
                id: 118,
                questionId: 30,
                text: "Historic",
                isCorrect: false,
            },
            {
                id: 119,
                questionId: 30,
                text: "Traditional",
                isCorrect: false,
            },

            // Question 31: Choose the correct meaning of 'meticulous':
            {
                id: 120,
                questionId: 31,
                text: "Careless",
                isCorrect: false,
            },
            {
                id: 121,
                questionId: 31,
                text: "Very careful and precise",
                isCorrect: true,
            },
            {
                id: 122,
                questionId: 31,
                text: "Fast",
                isCorrect: false,
            },
            {
                id: 123,
                questionId: 31,
                text: "Lazy",
                isCorrect: false,
            },

            // Question 32: What does 'eloquent' mean?
            {
                id: 124,
                questionId: 32,
                text: "Speaking fluently and persuasively",
                isCorrect: true,
            },
            {
                id: 125,
                questionId: 32,
                text: "Speaking quietly",
                isCorrect: false,
            },
            {
                id: 126,
                questionId: 32,
                text: "Speaking rudely",
                isCorrect: false,
            },
            {
                id: 127,
                questionId: 32,
                text: "Not speaking at all",
                isCorrect: false,
            },

            // Question 33: Which word means 'to make worse'?
            {
                id: 128,
                questionId: 33,
                text: "Improve",
                isCorrect: false,
            },
            {
                id: 129,
                questionId: 33,
                text: "Aggravate",
                isCorrect: true,
            },
            {
                id: 130,
                questionId: 33,
                text: "Fix",
                isCorrect: false,
            },
            {
                id: 131,
                questionId: 33,
                text: "Enhance",
                isCorrect: false,
            },

            // Question 34: What is a synonym for 'brave'?
            {
                id: 132,
                questionId: 34,
                text: "Cowardly",
                isCorrect: false,
            },
            {
                id: 133,
                questionId: 34,
                text: "Courageous",
                isCorrect: true,
            },
            {
                id: 134,
                questionId: 34,
                text: "Fearful",
                isCorrect: false,
            },
            {
                id: 135,
                questionId: 34,
                text: "Timid",
                isCorrect: false,
            },

            // Question 35: Choose the meaning of 'ambiguous':
            {
                id: 136,
                questionId: 35,
                text: "Clear and obvious",
                isCorrect: false,
            },
            {
                id: 137,
                questionId: 35,
                text: "Having multiple meanings",
                isCorrect: true,
            },
            {
                id: 138,
                questionId: 35,
                text: "Very simple",
                isCorrect: false,
            },
            {
                id: 139,
                questionId: 35,
                text: "Completely wrong",
                isCorrect: false,
            },
        ]);

        console.log("Added options for vocabulary test successfully!");

        // Add options for Test 3 (Listening Comprehension)
        await db.insert(schema.testOptions).values([
            // Question 36: Listen to the conversation. What time does the meeting start?
            {
                id: 140,
                questionId: 36,
                text: "9:00 AM",
                isCorrect: true,
            },
            {
                id: 141,
                questionId: 36,
                text: "9:30 AM",
                isCorrect: false,
            },
            {
                id: 142,
                questionId: 36,
                text: "10:00 AM",
                isCorrect: false,
            },
            {
                id: 143,
                questionId: 36,
                text: "10:30 AM",
                isCorrect: false,
            },

            // Question 37: In the dialogue, where are the speakers planning to meet?
            {
                id: 144,
                questionId: 37,
                text: "At the coffee shop",
                isCorrect: false,
            },
            {
                id: 145,
                questionId: 37,
                text: "At the conference room",
                isCorrect: true,
            },
            {
                id: 146,
                questionId: 37,
                text: "At the library",
                isCorrect: false,
            },
            {
                id: 147,
                questionId: 37,
                text: "At the restaurant",
                isCorrect: false,
            },

            // Question 38: What is the main topic of the conversation?
            {
                id: 148,
                questionId: 38,
                text: "Weekend plans",
                isCorrect: false,
            },
            {
                id: 149,
                questionId: 38,
                text: "Project deadline",
                isCorrect: true,
            },
            {
                id: 150,
                questionId: 38,
                text: "Vacation planning",
                isCorrect: false,
            },
            {
                id: 151,
                questionId: 38,
                text: "Office renovation",
                isCorrect: false,
            },

            // Question 39: How does the woman feel about the proposal?
            {
                id: 152,
                questionId: 39,
                text: "Excited",
                isCorrect: true,
            },
            {
                id: 153,
                questionId: 39,
                text: "Worried",
                isCorrect: false,
            },
            {
                id: 154,
                questionId: 39,
                text: "Angry",
                isCorrect: false,
            },
            {
                id: 155,
                questionId: 39,
                text: "Confused",
                isCorrect: false,
            },

            // Question 40: What does the man suggest they should do next?
            {
                id: 156,
                questionId: 40,
                text: "Take a break",
                isCorrect: false,
            },
            {
                id: 157,
                questionId: 40,
                text: "Schedule another meeting",
                isCorrect: true,
            },
            {
                id: 158,
                questionId: 40,
                text: "Cancel the project",
                isCorrect: false,
            },
            {
                id: 159,
                questionId: 40,
                text: "Ask for more budget",
                isCorrect: false,
            },

            // Question 41: Listen to the announcement. What gate number is mentioned?
            {
                id: 160,
                questionId: 41,
                text: "Gate 12",
                isCorrect: false,
            },
            {
                id: 161,
                questionId: 41,
                text: "Gate 15",
                isCorrect: true,
            },
            {
                id: 162,
                questionId: 41,
                text: "Gate 18",
                isCorrect: false,
            },
            {
                id: 163,
                questionId: 41,
                text: "Gate 21",
                isCorrect: false,
            },

            // Question 42: In the phone conversation, what is the caller's main concern?
            {
                id: 164,
                questionId: 42,
                text: "Billing issue",
                isCorrect: true,
            },
            {
                id: 165,
                questionId: 42,
                text: "Technical support",
                isCorrect: false,
            },
            {
                id: 166,
                questionId: 42,
                text: "Product information",
                isCorrect: false,
            },
            {
                id: 167,
                questionId: 42,
                text: "Delivery status",
                isCorrect: false,
            },

            // Question 43: What time is the flight departure according to the announcement?
            {
                id: 168,
                questionId: 43,
                text: "2:15 PM",
                isCorrect: false,
            },
            {
                id: 169,
                questionId: 43,
                text: "2:45 PM",
                isCorrect: true,
            },
            {
                id: 170,
                questionId: 43,
                text: "3:15 PM",
                isCorrect: false,
            },
            {
                id: 171,
                questionId: 43,
                text: "3:45 PM",
                isCorrect: false,
            },
        ]);

        console.log("Added options for listening comprehension test successfully!");
        console.log("✅ All practice tests data added successfully!");

    } catch (error) {
        console.error("Error adding practice tests:", error);
        throw error;
    }
};

export default addPracticeTests;

if (require.main === module) {
    addPracticeTests()
        .then(() => {
            console.log("✅ Practice tests added successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to add practice tests:", error);
            process.exit(1);
        });
}
