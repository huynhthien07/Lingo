import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const addPracticeExercises = async () => {
    try {
        console.log("Adding practice exercises...");
        
        // Get course IDs
        const courses = await sql`SELECT id, title FROM courses ORDER BY id`;
        console.log("Available courses:", courses);
        
        // Add practice lessons for each course
        for (const course of courses) {
            console.log(`\nAdding practice exercises for ${course.title}...`);
            
            // Create a practice unit for each course
            const practiceUnit = await db.insert(schema.units).values({
                title: "Practice Exercises",
                description: "Practice lessons to improve your skills",
                courseId: course.id,
                order: 999 // Put practice at the end
            }).returning();
            
            const unitId = practiceUnit[0].id;
            console.log(`Created practice unit with ID: ${unitId}`);
            
            // Create 3 practice lessons (representing the "3 women" exercises)
            const practiceTopics = [
                {
                    title: "Listening Practice: Three Friends",
                    description: "Listen to a conversation between three women friends"
                },
                {
                    title: "Reading Practice: Women in Business",
                    description: "Read about three successful businesswomen"
                },
                {
                    title: "Speaking Practice: Daily Conversations",
                    description: "Practice conversations between three women in different situations"
                }
            ];
            
            for (let i = 0; i < practiceTopics.length; i++) {
                const topic = practiceTopics[i];
                
                // Create practice lesson
                const lesson = await db.insert(schema.lessons).values({
                    title: topic.title,
                    unitId: unitId,
                    order: i + 1
                }).returning();
                
                const lessonId = lesson[0].id;
                console.log(`Created lesson: ${topic.title} (ID: ${lessonId})`);
                
                // Add challenges for each lesson
                const challenges = [];
                
                if (i === 0) { // Listening Practice
                    challenges.push(
                        {
                            lessonId: lessonId,
                            type: "LISTENING" as const,
                            order: 1,
                            question: "Listen to the conversation. What are the three women discussing?"
                        },
                        {
                            lessonId: lessonId,
                            type: "LISTENING" as const,
                            order: 2,
                            question: "Which woman suggests going to the restaurant?"
                        },
                        {
                            lessonId: lessonId,
                            type: "VOCABULARY" as const,
                            order: 3,
                            question: "Complete the sentence: 'The three women decided to _____ together.'"
                        },
                        {
                            lessonId: lessonId,
                            type: "LISTENING" as const,
                            order: 4,
                            question: "What time do they agree to meet?"
                        },
                        {
                            lessonId: lessonId,
                            type: "GRAMMAR" as const,
                            order: 5,
                            question: "Choose the correct form: 'They _____ friends for many years.'"
                        }
                    );
                } else if (i === 1) { // Reading Practice
                    challenges.push(
                        {
                            lessonId: lessonId,
                            type: "READING" as const,
                            order: 1,
                            question: "Read the text. Which woman is the CEO of a technology company?"
                        },
                        {
                            lessonId: lessonId,
                            type: "READING" as const,
                            order: 2,
                            question: "According to the text, what challenge did all three women face?"
                        },
                        {
                            lessonId: lessonId,
                            type: "VOCABULARY" as const,
                            order: 3,
                            question: "What does 'entrepreneur' mean in this context?"
                        },
                        {
                            lessonId: lessonId,
                            type: "READING" as const,
                            order: 4,
                            question: "Which woman started her business first?"
                        },
                        {
                            lessonId: lessonId,
                            type: "GRAMMAR" as const,
                            order: 5,
                            question: "Identify the past perfect tense in the second paragraph."
                        }
                    );
                } else { // Speaking Practice
                    challenges.push(
                        {
                            lessonId: lessonId,
                            type: "SELECT" as const,
                            order: 1,
                            question: "Choose the best response: 'Would you like to join us for coffee?'"
                        },
                        {
                            lessonId: lessonId,
                            type: "VOCABULARY" as const,
                            order: 2,
                            question: "Complete the dialogue: 'I'm sorry, I can't _____ you today.'"
                        },
                        {
                            lessonId: lessonId,
                            type: "GRAMMAR" as const,
                            order: 3,
                            question: "Choose the correct question form: '_____ you been to the new restaurant?'"
                        },
                        {
                            lessonId: lessonId,
                            type: "SELECT" as const,
                            order: 4,
                            question: "What's the most polite way to decline an invitation?"
                        },
                        {
                            lessonId: lessonId,
                            type: "VOCABULARY" as const,
                            order: 5,
                            question: "Which phrase shows agreement? 'I _____ with you.'"
                        }
                    );
                }
                
                // Insert challenges
                await db.insert(schema.challenges).values(challenges);
                console.log(`Added ${challenges.length} challenges for ${topic.title}`);
                
                // Add challenge options for each challenge
                const insertedChallenges = await sql`
                    SELECT id, type, question FROM challenges 
                    WHERE lesson_id = ${lessonId} 
                    ORDER BY "order"
                `;
                
                for (const challenge of insertedChallenges) {
                    let options = [];
                    
                    // Create appropriate options based on challenge type and content
                    if (challenge.question.includes("three women discussing")) {
                        options = [
                            { text: "Their weekend plans", correct: true },
                            { text: "Work problems", correct: false },
                            { text: "Shopping", correct: false },
                            { text: "Family issues", correct: false }
                        ];
                    } else if (challenge.question.includes("restaurant")) {
                        options = [
                            { text: "Sarah", correct: true },
                            { text: "Maria", correct: false },
                            { text: "Jennifer", correct: false },
                            { text: "All of them", correct: false }
                        ];
                    } else if (challenge.question.includes("decided to")) {
                        options = [
                            { text: "meet", correct: true },
                            { text: "work", correct: false },
                            { text: "study", correct: false },
                            { text: "travel", correct: false }
                        ];
                    } else if (challenge.question.includes("CEO")) {
                        options = [
                            { text: "Lisa Chen", correct: true },
                            { text: "Maria Rodriguez", correct: false },
                            { text: "Sarah Johnson", correct: false },
                            { text: "None of them", correct: false }
                        ];
                    } else if (challenge.question.includes("join us for coffee")) {
                        options = [
                            { text: "Yes, I'd love to!", correct: true },
                            { text: "No way!", correct: false },
                            { text: "Maybe later", correct: false },
                            { text: "I don't drink coffee", correct: false }
                        ];
                    } else {
                        // Default options for other questions
                        options = [
                            { text: "Option A", correct: true },
                            { text: "Option B", correct: false },
                            { text: "Option C", correct: false },
                            { text: "Option D", correct: false }
                        ];
                    }
                    
                    const challengeOptions = options.map(option => ({
                        challengeId: challenge.id,
                        text: option.text,
                        correct: option.correct
                    }));
                    
                    await db.insert(schema.challengeOptions).values(challengeOptions);
                }
            }
        }
        
        console.log("\n✅ Successfully added practice exercises for all courses!");
        
    } catch (error) {
        console.error("❌ Error adding practice exercises:", error);
        process.exit(1);
    }
};

addPracticeExercises();
