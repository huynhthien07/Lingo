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






        console.log("Seeding finished");
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to seed the database");
    }
};

main();