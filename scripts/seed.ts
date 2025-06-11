import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
// @ts-ignore
const db = drizzle(sql, { schema });

const main = async () => {
    try {
        console.log("Seeding database");
        await db.delete(schema.courses);
        await db.delete(schema.userProgress);
        await db.delete(schema.units);
        await db.delete(schema.lessons);
        await db.delete(schema.challenges);
        await db.delete(schema.challengeOptions);
        await db.delete(schema.challengeProgress);
        await db.delete(schema.userSubscription);

        // Delete test-related data
        await db.delete(schema.testOptions);
        await db.delete(schema.testQuestions);
        await db.delete(schema.tests);

        await db.insert(schema.courses).values([
            {
                id: 1,
                title: "Spanish",
                imageSrc: "/es.svg",
            },
            {
                id: 2,
                title: "English",
                imageSrc: "/en.svg",
            },
            {
                id: 3,
                title: "Italian",
                imageSrc: "/it.svg",
            },
            {
                id: 4,
                title: "French",
                imageSrc: "/fr.svg",
            },
        ]);

        // await db.insert(schema.units).values([
        //     {
        //         id: 1,
        //         courseId: 1,
        //         title: "Unit 1",
        //         description: "Learn the basics of Spanish",
        //         order: 1,
        //     },

        // ]);

        // await db.insert(schema.lessons).values([
        //     {
        //         id: 1,
        //         unitId: 1,
        //         order: 1,
        //         title: "Nouns",
        //     },
        //     {
        //         id: 2,
        //         unitId: 1,
        //         order: 2,
        //         title: "Verbs",
        //     },
        //     {
        //         id: 3,
        //         unitId: 1,
        //         order: 3,
        //         title: "Verbs",
        //     }, {
        //         id: 4,
        //         unitId: 1,
        //         order: 4,
        //         title: "Verbs",
        //     }, {
        //         id: 5,
        //         unitId: 1,
        //         order: 5,
        //         title: "Verbs",
        //     },
        // ]);

        // await db.insert(schema.challenges).values([
        //     {
        //         id: 1,
        //         lessonId: 1,
        //         type: "SELECT",
        //         order: 1,
        //         question: 'Which one of these is the "man"?',

        //     },
        //     {
        //         id: 2,
        //         lessonId: 1, // Nouns
        //         type: "ASSIST",
        //         order: 2,
        //         question: 'The man',
        //     }
        // ]);

        // await db.insert(schema.challengeOptions).values([
        //     {
        //         id: 1,
        //         challengeId: 1, // Which one of these is "the man"?
        //         imageSrc: "/man.svg",
        //         correct: true,
        //         text: "el hombre",
        //         audioSrc: "/es_man.mp3",
        //     },
        //     {
        //         id: 2,
        //         challengeId: 1,
        //         imageSrc: "/woman.svg",
        //         correct: false,
        //         text: "la mujer",
        //         audioSrc: "/es_woman.mp3",
        //     },
        //     {
        //         id: 3,
        //         challengeId: 1,
        //         imageSrc: "/robot.svg",
        //         correct: false,
        //         text: "el robot",
        //         audioSrc: "/es_robot.mp3",
        //     },

        // ]);


        //English

        await db.insert(schema.units).values([
            {
                id: 1,
                courseId: 2, // English course
                title: "Unit 1",
                description: "Learn the basics of English",
                order: 1,
            },
        ]);

        await db.insert(schema.lessons).values([
            { id: 1, unitId: 1, order: 1, title: "Nouns" },
            { id: 2, unitId: 1, order: 2, title: "Verbs" },
            { id: 3, unitId: 1, order: 3, title: "Adjectives" },
            { id: 4, unitId: 1, order: 4, title: "Pronouns" },
            { id: 5, unitId: 1, order: 5, title: "Prepositions" },
        ]);

        await db.insert(schema.challenges).values([
            // Challenges for Lesson 1:
            { id: 1, lessonId: 1, type: "GRAMMAR", order: 1, question: "Mạo từ nào được dùng với danh từ số ít?" },
            { id: 2, lessonId: 1, type: "VOCABULARY", order: 2, question: "Từ có nghĩa là 'Sách'?" },
            { id: 3, lessonId: 1, type: "LISTENING", order: 3, question: "Đâu là từ có nghĩa là 'bạn'?" },
            { id: 4, lessonId: 1, type: "READING", order: 4, question: "Dịch câu: 'Chàng trai đang đọc sách.'" },
            { id: 5, lessonId: 1, type: "VOCABULARY", order: 5, question: "Từ có nghĩa là 'Bong bóng'?" },

            // // Challenges for Lesson 2:
            { id: 6, lessonId: 2, type: "GRAMMAR", order: 1, question: "Quá khứ của 'run' là gì?" },
            { id: 7, lessonId: 2, type: "VOCABULARY", order: 2, question: "Từ tiếng Anh của 'chạy' là gì?" },
            { id: 8, lessonId: 2, type: "LISTENING", order: 3, question: "Nghe từ có phiên âm 'rən'?" },
            { id: 9, lessonId: 2, type: "READING", order: 4, question: "Dịch: 'Cô ấy đang chạy nhanh.'" },
            { id: 10, lessonId: 2, type: "VOCABULARY", order: 5, question: "Từ tiếng Anh của từ 'đi bộ' là gì?" },

            // // Challenges for Lesson 3:
            { id: 11, lessonId: 3, type: "GRAMMAR", order: 1, question: "Tính từ nào dùng để mô tả kích thước?" },
            { id: 12, lessonId: 3, type: "VOCABULARY", order: 2, question: "Từ tiếng Anh của 'grande' là gì?" },
            { id: 13, lessonId: 3, type: "LISTENING", order: 3, question: "Từ của phiên âm 'sɔːt'" },
            { id: 14, lessonId: 3, type: "READING", order: 4, question: "Dịch câu sau: 'Ngôi nhà to thật đẹp." },
            { id: 15, lessonId: 3, type: "VOCABULARY", order: 5, question: "Từ tiếng Anh của 'nhỏ' là gì?" },

            // // Challenges for Lesson 4:
            // { id: 16, lessonId: 4, type: "GRAMMAR", order: 1, question: "Which pronoun is used for a male subject?" },
            // { id: 17, lessonId: 4, type: "VOCABULARY", order: 2, question: "What is the English word for 'él'?" },
            // { id: 18, lessonId: 4, type: "LISTENING", order: 3, question: "What pronoun did you hear?" },
            // { id: 19, lessonId: 4, type: "READING", order: 4, question: "Translate: 'He is a teacher.'" },
            // { id: 20, lessonId: 4, type: "VOCABULARY", order: 5, question: "What is the English word for 'ella'?" },

            // // Challenges for Lesson 5:
            // { id: 21, lessonId: 5, type: "GRAMMAR", order: 1, question: "Which preposition is used for location?" },
            // { id: 22, lessonId: 5, type: "VOCABULARY", order: 2, question: "What is the English word for 'sobre'?" },
            // { id: 23, lessonId: 5, type: "LISTENING", order: 3, question: "What preposition did you hear?" },
            // { id: 24, lessonId: 5, type: "READING", order: 4, question: "Translate: 'The book is on the table.'" },
            // { id: 25, lessonId: 5, type: "VOCABULARY", order: 5, question: "What is the English word for 'debajo'?" },
        ]);

        await db.insert(schema.challengeOptions).values([
            // Options for Challenge 1
            { id: 1, challengeId: 1, text: "a", correct: true },
            { id: 2, challengeId: 1, text: "an", correct: true },
            { id: 3, challengeId: 1, text: "the", correct: false },

            // Options for Challenge 2
            { id: 4, challengeId: 2, text: "book", correct: true },
            { id: 5, challengeId: 2, text: "pen", correct: false },
            { id: 6, challengeId: 2, text: "apple", correct: false },

            // Options for Challenge 3
            {
                id: 7,
                challengeId: 3,
                // imageSrc: "/man.svg",
                correct: false,
                text: "boy",
                audioSrc: "/boy.mp3",
            },
            {
                id: 8,
                challengeId: 3,
                // imageSrc: "/man.svg",
                correct: false,
                text: "man",
                audioSrc: "/man.mp3",
            },
            {
                id: 9,
                challengeId: 3,
                // imageSrc: "/man.svg",
                correct: false,
                text: "woman",
                audioSrc: "/woman.mp3",
            },
            {
                id: 10,
                challengeId: 3,
                // imageSrc: "/man.svg",
                correct: true,
                text: "you",
                audioSrc: "/you.mp3",
            },

            // Options for Challenge 4
            { id: 11, challengeId: 4, text: "The boy is reading a book.", correct: true },
            { id: 12, challengeId: 4, text: "The boy are reading a book.", correct: false },
            { id: 13, challengeId: 4, text: "The boy read a book.", correct: false },

            // Options for Challenge 5
            { id: 14, challengeId: 5, text: "ball", correct: false },
            { id: 15, challengeId: 5, text: "balloon", correct: true },
            { id: 16, challengeId: 5, text: "Badminton", correct: false },

            // Challenge 6 - 
            // { id: 6, lessonId: 2, type: "GRAMMAR", order: 1, question: "Quá khứ của 'run' là gì?" },
            { id: 17, challengeId: 6, text: "ran", correct: true },
            { id: 18, challengeId: 6, text: "runned", correct: false },
            { id: 19, challengeId: 6, text: "running", correct: false },

            // Challenge 7 - 
            // { id: 7, lessonId: 2, type: "VOCABULARY", order: 2, question: "Từ tiếng Anh của 'chạychạy' là gì?" },
            { id: 20, challengeId: 7, text: "run", correct: true },
            { id: 21, challengeId: 7, text: "eat", correct: false },
            { id: 22, challengeId: 7, text: "walk", correct: false },

            // Challenge 8 - 
            // { id: 8, lessonId: 2, type: "LISTENING", order: 3, question: "Nghe từ có phiên âm 'rən'?" },
            { id: 23, challengeId: 8, text: "run", correct: true, audioSrc: "/run.mp3" },
            { id: 24, challengeId: 8, text: "sit", correct: false, audioSrc: "/sit.mp3" },
            { id: 25, challengeId: 8, text: "stand", correct: false, audioSrc: "/stand.mp3" },

            // Challenge 9 - 
            // { id: 9, lessonId: 2, type: "READING", order: 4, question: "Dịch: 'Cô ấy đang chạy nhanh.'" },
            { id: 26, challengeId: 9, text: "She is running fast.", correct: true },
            { id: 27, challengeId: 9, text: "She is walking fast.", correct: false },
            { id: 28, challengeId: 9, text: "She is eating fast.", correct: false },

            // Challenge 10 - 
            // { id: 10, lessonId: 2, type: "VOCABULARY", order: 5, question: "Từ tiếng Anh của từ "đi bộ" là gì?" },
            { id: 29, challengeId: 10, text: "walk", correct: true },
            { id: 30, challengeId: 10, text: "run", correct: false },
            { id: 31, challengeId: 10, text: "jump", correct: false },


            // Challenge 11 - GRAMMAR
            // { id: 11, lessonId: 3, type: "GRAMMAR", order: 1, question: "Tính từ nào dùng để mô tả kích thước?" },
            { id: 32, challengeId: 11, text: "big", correct: true },
            { id: 33, challengeId: 11, text: "happy", correct: false },
            { id: 34, challengeId: 11, text: "quick", correct: false },

            // Challenge 12 - VOCABULARY
            // { id: 12, lessonId: 3, type: "VOCABULARY", order: 2, question: "Từ tiếng Anh của 'grande' là gì?" },
            { id: 35, challengeId: 12, text: "big", correct: true },
            { id: 36, challengeId: 12, text: "small", correct: false },
            { id: 37, challengeId: 12, text: "old", correct: false },

            // Challenge 13 - LISTENING
            // { id: 13, lessonId: 3, type: "LISTENING", order: 3, question: "Bạn đã nghe thấy tính từ nào?" },
            { id: 38, challengeId: 13, text: "sort", correct: true, audioSrc: "/sort.mp3" },
            { id: 39, challengeId: 13, text: "shock", correct: false, audioSrc: "/shock.mp3" },
            { id: 40, challengeId: 13, text: "short", correct: false, audioSrc: "/short.mp3" },

            // Challenge 14 - READING
            // { id: 14, lessonId: 3, type: "READING", order: 4, question: "Dịch câu sau: 'Ngôi nhà to thật đẹp.'" },
            { id: 41, challengeId: 14, text: "The big house is beautiful.", correct: true },
            { id: 42, challengeId: 14, text: "The small house is beautiful.", correct: false },
            { id: 43, challengeId: 14, text: "The old house is beautiful.", correct: false },

            // Challenge 15 - VOCABULARY
            // { id: 15, lessonId: 3, type: "VOCABULARY", order: 5, question: "Từ tiếng Anh của 'nhỏ' là gì?" },
            { id: 44, challengeId: 15, text: "small", correct: true },
            { id: 45, challengeId: 15, text: "large", correct: false },
            { id: 46, challengeId: 15, text: "tiny", correct: false },




        ]);

        // Add test demo data
        await db.insert(schema.tests).values([
            {
                id: 1,
                title: "English Grammar Test",
                imageSrc: "/grammar-test.svg",
                duration: 30, // 30 minutes
                createdAt: new Date(),
            },
        ]);

        // Add test questions
        await db.insert(schema.testQuestions).values([
            {
                id: 1,
                testId: 1,
                text: "Which of the following is a correct sentence?",
                order: 1,
            },
            {
                id: 2,
                testId: 1,
                text: "Choose the correct form of the verb:",
                order: 2,
            },
            {
                id: 3,
                testId: 1,
                text: "What is the plural form of 'child'?",
                order: 3,
            },
            {
                id: 4,
                testId: 1,
                text: "Which sentence uses the correct article?",
                order: 4,
            },
            {
                id: 5,
                testId: 1,
                text: "Identify the correct comparative form:",
                order: 5,
            },
            {
                id: 6,
                testId: 1,
                text: "Choose the correct preposition:",
                order: 6,
            },
            {
                id: 7,
                testId: 1,
                text: "Which sentence has the correct subject-verb agreement?",
                order: 7,
            },
            {
                id: 8,
                testId: 1,
                text: "Identify the correct past tense form:",
                order: 8,
            },
            {
                id: 9,
                testId: 1,
                text: "Choose the correct pronoun:",
                order: 9,
            },
            {
                id: 10,
                testId: 1,
                text: "Which sentence uses the correct conjunction?",
                order: 10,
            },
            {
                id: 11,
                testId: 1,
                text: "Identify the sentence with correct punctuation:",
                order: 11,
            },
            {
                id: 12,
                testId: 1,
                text: "Choose the correct modal verb:",
                order: 12,
            },
            {
                id: 13,
                testId: 1,
                text: "Which word is a synonym for 'happy'?",
                order: 13,
            },
            {
                id: 14,
                testId: 1,
                text: "Identify the correct passive voice sentence:",
                order: 14,
            },
            {
                id: 15,
                testId: 1,
                text: "Choose the correct conditional form:",
                order: 15,
            },
            {
                id: 16,
                testId: 1,
                text: "Which sentence uses the present perfect tense correctly?",
                order: 16,
            },
            {
                id: 17,
                testId: 1,
                text: "Identify the correct order of adjectives:",
                order: 17,
            },
            {
                id: 18,
                testId: 1,
                text: "Choose the correct phrasal verb:",
                order: 18,
            },
            {
                id: 19,
                testId: 1,
                text: "Which sentence contains a gerund?",
                order: 19,
            },
            {
                id: 20,
                testId: 1,
                text: "Identify the correct reported speech:",
                order: 20,
            },
            {
                id: 21,
                testId: 1,
                text: "Choose the correct relative pronoun:",
                order: 21,
            },
            {
                id: 22,
                testId: 1,
                text: "Which sentence uses articles correctly?",
                order: 22,
            },
            {
                id: 23,
                testId: 1,
                text: "Identify the correct future tense form:",
                order: 23,
            },
            {
                id: 24,
                testId: 1,
                text: "Choose the correct quantifier:",
                order: 24,
            },
            {
                id: 25,
                testId: 1,
                text: "Which sentence has the correct word order?",
                order: 25,
            },
        ]);

        // Add test options
        await db.insert(schema.testOptions).values([
            // Options for question 1
            {
                id: 1,
                questionId: 1,
                text: "She don't like coffee.",
                isCorrect: false,
            },
            {
                id: 2,
                questionId: 1,
                text: "She doesn't like coffee.",
                isCorrect: true,
            },
            {
                id: 3,
                questionId: 1,
                text: "She not like coffee.",
                isCorrect: false,
            },
            // Options for question 2
            {
                id: 4,
                questionId: 2,
                text: "I have went to the store yesterday.",
                isCorrect: false,
            },
            {
                id: 5,
                questionId: 2,
                text: "I went to the store yesterday.",
                isCorrect: true,
            },
            {
                id: 6,
                questionId: 2,
                text: "I have gone to the store yesterday.",
                isCorrect: false,
            },
            // Question 3
            {
                id: 7,
                questionId: 3,
                text: "Childs",
                isCorrect: false,
            },
            {
                id: 8,
                questionId: 3,
                text: "Children",
                isCorrect: true,
            },
            {
                id: 9,
                questionId: 3,
                text: "Childrens",
                isCorrect: false,
            },
            // Question 4
            {
                id: 10,
                questionId: 4,
                text: "I saw a elephant at the zoo.",
                isCorrect: false,
            },
            {
                id: 11,
                questionId: 4,
                text: "I saw an elephant at the zoo.",
                isCorrect: true,
            },
            {
                id: 12,
                questionId: 4,
                text: "I saw elephant at the zoo.",
                isCorrect: false,
            },
            // Question 5
            {
                id: 13,
                questionId: 5,
                text: "This building is more taller than that one.",
                isCorrect: false,
            },
            {
                id: 14,
                questionId: 5,
                text: "This building is taller than that one.",
                isCorrect: true,
            },
            {
                id: 15,
                questionId: 5,
                text: "This building is tallest than that one.",
                isCorrect: false,
            },
            // Question 6
            {
                id: 16,
                questionId: 6,
                text: "The book is in the table.",
                isCorrect: false,
            },
            {
                id: 17,
                questionId: 6,
                text: "The book is on the table.",
                isCorrect: true,
            },
            {
                id: 18,
                questionId: 6,
                text: "The book is at the table.",
                isCorrect: false,
            },
            // Question 7
            {
                id: 19,
                questionId: 7,
                text: "The team are playing well.",
                isCorrect: false,
            },
            {
                id: 20,
                questionId: 7,
                text: "The team is playing well.",
                isCorrect: true,
            },
            {
                id: 21,
                questionId: 7,
                text: "The team be playing well.",
                isCorrect: false,
            },
            // Question 8
            {
                id: 22,
                questionId: 8,
                text: "I teached English last year.",
                isCorrect: false,
            },
            {
                id: 23,
                questionId: 8,
                text: "I taught English last year.",
                isCorrect: true,
            },
            {
                id: 24,
                questionId: 8,
                text: "I have teach English last year.",
                isCorrect: false,
            },
            // Question 9
            {
                id: 25,
                questionId: 9,
                text: "This is she book.",
                isCorrect: false,
            },
            {
                id: 26,
                questionId: 9,
                text: "This is her book.",
                isCorrect: true,
            },
            {
                id: 27,
                questionId: 9,
                text: "This is hers book.",
                isCorrect: false,
            },
            // Question 10
            {
                id: 28,
                questionId: 10,
                text: "I like tea but I don't like coffee.",
                isCorrect: true,
            },
            {
                id: 29,
                questionId: 10,
                text: "I like tea and I don't like coffee.",
                isCorrect: false,
            },
            {
                id: 30,
                questionId: 10,
                text: "I like tea so I don't like coffee.",
                isCorrect: false,
            },
            // Question 11
            {
                id: 31,
                questionId: 11,
                text: "Where are you going.",
                isCorrect: false,
            },
            {
                id: 32,
                questionId: 11,
                text: "Where are you going?",
                isCorrect: true,
            },
            {
                id: 33,
                questionId: 11,
                text: "Where are you going!",
                isCorrect: false,
            },
            // Question 12
            {
                id: 34,
                questionId: 12,
                text: "You must to study harder.",
                isCorrect: false,
            },
            {
                id: 35,
                questionId: 12,
                text: "You must study harder.",
                isCorrect: true,
            },
            {
                id: 36,
                questionId: 12,
                text: "You should must study harder.",
                isCorrect: false,
            },
            // Question 13
            {
                id: 37,
                questionId: 13,
                text: "Sad",
                isCorrect: false,
            },
            {
                id: 38,
                questionId: 13,
                text: "Joyful",
                isCorrect: true,
            },
            {
                id: 39,
                questionId: 13,
                text: "Angry",
                isCorrect: false,
            },
            // Question 14
            {
                id: 40,
                questionId: 14,
                text: "John wrote the letter.",
                isCorrect: false,
            },
            {
                id: 41,
                questionId: 14,
                text: "The letter was written by John.",
                isCorrect: true,
            },
            {
                id: 42,
                questionId: 14,
                text: "The letter is writing by John.",
                isCorrect: false,
            },
            // Question 15
            {
                id: 43,
                questionId: 15,
                text: "If I will have time, I will call you.",
                isCorrect: false,
            },
            {
                id: 44,
                questionId: 15,
                text: "If I have time, I will call you.",
                isCorrect: true,
            },
            {
                id: 45,
                questionId: 15,
                text: "If I have time, I would call you.",
                isCorrect: false,
            },
            // Question 16
            {
                id: 46,
                questionId: 16,
                text: "I have finished my homework yesterday.",
                isCorrect: false,
            },
            {
                id: 47,
                questionId: 16,
                text: "I have finished my homework.",
                isCorrect: true,
            },
            {
                id: 48,
                questionId: 16,
                text: "I have finish my homework.",
                isCorrect: false,
            },
            // Question 17
            {
                id: 49,
                questionId: 17,
                text: "A red big car",
                isCorrect: false,
            },
            {
                id: 50,
                questionId: 17,
                text: "A big red car",
                isCorrect: true,
            },
            {
                id: 51,
                questionId: 17,
                text: "A car red big",
                isCorrect: false,
            },
            // Question 18
            {
                id: 52,
                questionId: 18,
                text: "I'm looking after my sister's children.",
                isCorrect: true,
            },
            {
                id: 53,
                questionId: 18,
                text: "I'm looking my sister's children.",
                isCorrect: false,
            },
            {
                id: 54,
                questionId: 18,
                text: "I'm looking at my sister's children.",
                isCorrect: false,
            },
            // Question 19
            {
                id: 55,
                questionId: 19,
                text: "I like swim in the ocean.",
                isCorrect: false,
            },
            {
                id: 56,
                questionId: 19,
                text: "I like swimming in the ocean.",
                isCorrect: true,
            },
            {
                id: 57,
                questionId: 19,
                text: "I like to swim in the ocean.",
                isCorrect: false,
            },
            // Question 20
            {
                id: 58,
                questionId: 20,
                text: "She said, 'I am happy.'",
                isCorrect: false,
            },
            {
                id: 59,
                questionId: 20,
                text: "She said that she was happy.",
                isCorrect: true,
            },
            {
                id: 60,
                questionId: 20,
                text: "She said that she is happy.",
                isCorrect: false,
            },
            // Question 21
            {
                id: 61,
                questionId: 21,
                text: "The man which lives next door is friendly.",
                isCorrect: false,
            },
            {
                id: 62,
                questionId: 21,
                text: "The man who lives next door is friendly.",
                isCorrect: true,
            },
            {
                id: 63,
                questionId: 21,
                text: "The man whose lives next door is friendly.",
                isCorrect: false,
            },
            // Question 22
            {
                id: 64,
                questionId: 22,
                text: "I need a umbrella because it's raining.",
                isCorrect: false,
            },
            {
                id: 65,
                questionId: 22,
                text: "I need an umbrella because it's raining.",
                isCorrect: true,
            },
            {
                id: 66,
                questionId: 22,
                text: "I need umbrella because it's raining.",
                isCorrect: false,
            },
            // Question 23
            {
                id: 67,
                questionId: 23,
                text: "I will going to the party tomorrow.",
                isCorrect: false,
            },
            {
                id: 68,
                questionId: 23,
                text: "I will go to the party tomorrow.",
                isCorrect: true,
            },
            {
                id: 69,
                questionId: 23,
                text: "I go to the party tomorrow.",
                isCorrect: false,
            },
            // Question 24
            {
                id: 70,
                questionId: 24,
                text: "There is few water in the bottle.",
                isCorrect: false,
            },
            {
                id: 71,
                questionId: 24,
                text: "There is a little water in the bottle.",
                isCorrect: true,
            },
            {
                id: 72,
                questionId: 24,
                text: "There is little water in the bottle.",
                isCorrect: false,
            },
            // Question 25
            {
                id: 73,
                questionId: 25,
                text: "Always she arrives early.",
                isCorrect: false,
            },
            {
                id: 74,
                questionId: 25,
                text: "She always arrives early.",
                isCorrect: true,
            },
            {
                id: 75,
                questionId: 25,
                text: "She arrives always early.",
                isCorrect: false,
            },
        ]);

        console.log("Seeding finished");
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to seed the database");
    }
};

main();
