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
                title: "English Starter",
                imageSrc: "/en.svg",
            },
            {
                id: 2,
                title: "English 5.0",
                imageSrc: "/en.svg",
            },
            {
                id: 3,
                title: "English 6.0",
                imageSrc: "/en.svg",
            },
            {
                id: 4,
                title: "French Starter",
                imageSrc: "/fr.svg",
            },
            {
                id: 5,
                title: "Spanish Starter",
                imageSrc: "/es.svg",
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


        // Units for all courses
        await db.insert(schema.units).values([
            // English Starter
            {
                id: 1,
                courseId: 1,
                title: "Basic Grammar",
                description: "Learn fundamental English grammar",
                order: 1,
            },
            {
                id: 2,
                courseId: 1,
                title: "Essential Vocabulary",
                description: "Build your basic vocabulary",
                order: 2,
            },
            // English 5.0
            {
                id: 3,
                courseId: 2,
                title: "Intermediate Grammar",
                description: "Advanced grammar structures",
                order: 1,
            },
            {
                id: 4,
                courseId: 2,
                title: "Reading Comprehension",
                description: "Improve reading skills",
                order: 2,
            },
            // English 6.0
            {
                id: 5,
                courseId: 3,
                title: "Advanced Grammar",
                description: "Master complex grammar",
                order: 1,
            },
            {
                id: 6,
                courseId: 3,
                title: "Professional English",
                description: "Business and academic English",
                order: 2,
            },
            // French Starter
            {
                id: 7,
                courseId: 4,
                title: "Les Bases",
                description: "Learn basic French",
                order: 1,
            },
            {
                id: 8,
                courseId: 4,
                title: "Vocabulaire Essentiel",
                description: "Essential French vocabulary",
                order: 2,
            },
            // Spanish Starter
            {
                id: 9,
                courseId: 5,
                title: "Fundamentos",
                description: "Learn basic Spanish",
                order: 1,
            },
            {
                id: 10,
                courseId: 5,
                title: "Vocabulario Básico",
                description: "Essential Spanish vocabulary",
                order: 2,
            },
        ]);

        await db.insert(schema.lessons).values([
            // English Starter - Basic Grammar (Unit 1) - 5 parts
            { id: 1, unitId: 1, order: 1, title: "Articles (a, an, the)" },
            { id: 2, unitId: 1, order: 2, title: "Present Simple" },
            { id: 3, unitId: 1, order: 3, title: "Basic Nouns" },
            { id: 4, unitId: 1, order: 4, title: "Pronouns" },
            { id: 5, unitId: 1, order: 5, title: "Basic Adjectives" },

            // English Starter - Essential Vocabulary (Unit 2) - 5 parts
            { id: 6, unitId: 2, order: 1, title: "Family & Friends" },
            { id: 7, unitId: 2, order: 2, title: "Daily Activities" },
            { id: 8, unitId: 2, order: 3, title: "Colors & Numbers" },
            { id: 9, unitId: 2, order: 4, title: "Food & Drinks" },
            { id: 10, unitId: 2, order: 5, title: "Time & Days" },

            // English 5.0 - Intermediate Grammar (Unit 3) - 5 parts
            { id: 11, unitId: 3, order: 1, title: "Past Tenses" },
            { id: 12, unitId: 3, order: 2, title: "Future Forms" },
            { id: 13, unitId: 3, order: 3, title: "Modal Verbs" },
            { id: 14, unitId: 3, order: 4, title: "Perfect Tenses" },
            { id: 15, unitId: 3, order: 5, title: "Comparative & Superlative" },

            // English 5.0 - Reading Comprehension (Unit 4) - 5 parts
            { id: 16, unitId: 4, order: 1, title: "Short Stories" },
            { id: 17, unitId: 4, order: 2, title: "News Articles" },
            { id: 18, unitId: 4, order: 3, title: "Instructions" },
            { id: 19, unitId: 4, order: 4, title: "Advertisements" },
            { id: 20, unitId: 4, order: 5, title: "Letters & Emails" },

            // English 6.0 - Advanced Grammar (Unit 5) - 5 parts
            { id: 21, unitId: 5, order: 1, title: "Conditional Sentences" },
            { id: 22, unitId: 5, order: 2, title: "Passive Voice" },
            { id: 23, unitId: 5, order: 3, title: "Reported Speech" },
            { id: 24, unitId: 5, order: 4, title: "Relative Clauses" },
            { id: 25, unitId: 5, order: 5, title: "Subjunctive Mood" },

            // English 6.0 - Professional English (Unit 6) - 5 parts
            { id: 26, unitId: 6, order: 1, title: "Business Writing" },
            { id: 27, unitId: 6, order: 2, title: "Presentations" },
            { id: 28, unitId: 6, order: 3, title: "Academic English" },
            { id: 29, unitId: 6, order: 4, title: "Technical Writing" },
            { id: 30, unitId: 6, order: 5, title: "Professional Communication" },

            // French Starter - Les Bases (Unit 7) - 5 parts
            { id: 31, unitId: 7, order: 1, title: "Les Articles" },
            { id: 32, unitId: 7, order: 2, title: "Être et Avoir" },
            { id: 33, unitId: 7, order: 3, title: "Les Nombres" },
            { id: 34, unitId: 7, order: 4, title: "Les Pronoms" },
            { id: 35, unitId: 7, order: 5, title: "Les Adjectifs" },

            // French Starter - Vocabulaire Essentiel (Unit 8) - 5 parts
            { id: 36, unitId: 8, order: 1, title: "La Famille" },
            { id: 37, unitId: 8, order: 2, title: "Les Couleurs" },
            { id: 38, unitId: 8, order: 3, title: "La Nourriture" },
            { id: 39, unitId: 8, order: 4, title: "Les Vêtements" },
            { id: 40, unitId: 8, order: 5, title: "La Maison" },

            // Spanish Starter - Fundamentos (Unit 9) - 5 parts
            { id: 41, unitId: 9, order: 1, title: "Los Artículos" },
            { id: 42, unitId: 9, order: 2, title: "Ser y Estar" },
            { id: 43, unitId: 9, order: 3, title: "Los Números" },
            { id: 44, unitId: 9, order: 4, title: "Los Pronombres" },
            { id: 45, unitId: 9, order: 5, title: "Los Adjetivos" },

            // Spanish Starter - Vocabulario Básico (Unit 10) - 5 parts
            { id: 46, unitId: 10, order: 1, title: "La Familia" },
            { id: 47, unitId: 10, order: 2, title: "Los Colores" },
            { id: 48, unitId: 10, order: 3, title: "La Comida" },
            { id: 49, unitId: 10, order: 4, title: "La Ropa" },
            { id: 50, unitId: 10, order: 5, title: "La Casa" },
        ]);

        await db.insert(schema.challenges).values([
            // English Starter - Unit 1 - Lesson 1: Articles (5 questions)
            { id: 1, lessonId: 1, type: "GRAMMAR", order: 1, question: "Which article is used before a consonant sound?" },
            { id: 2, lessonId: 1, type: "VOCABULARY", order: 2, question: "Complete: ___ apple (an/a)" },
            { id: 3, lessonId: 1, type: "LISTENING", order: 3, question: "Listen and choose the correct article" },
            { id: 4, lessonId: 1, type: "READING", order: 4, question: "Read: 'I have ___ book.' Choose the correct article." },
            { id: 5, lessonId: 1, type: "GRAMMAR", order: 5, question: "When do we use 'the'?" },

            // English Starter - Unit 1 - Lesson 2: Present Simple (5 questions)
            { id: 6, lessonId: 2, type: "GRAMMAR", order: 1, question: "She ___ to school every day." },
            { id: 7, lessonId: 2, type: "VOCABULARY", order: 2, question: "What is the base form of 'goes'?" },
            { id: 8, lessonId: 2, type: "READING", order: 3, question: "Read: 'I work in an office.' What does this mean?" },
            { id: 9, lessonId: 2, type: "LISTENING", order: 4, question: "Listen and identify the present simple verb" },
            { id: 10, lessonId: 2, type: "GRAMMAR", order: 5, question: "Do you ___ English? (speak/speaks)" },

            // English Starter - Unit 1 - Lesson 3: Basic Nouns (5 questions)
            { id: 11, lessonId: 3, type: "VOCABULARY", order: 1, question: "What is the plural of 'child'?" },
            { id: 12, lessonId: 3, type: "LISTENING", order: 2, question: "Listen to the word and identify the noun" },
            { id: 13, lessonId: 3, type: "GRAMMAR", order: 3, question: "Which is countable: water/books?" },
            { id: 14, lessonId: 3, type: "READING", order: 4, question: "Read: 'The cats are sleeping.' How many cats?" },
            { id: 15, lessonId: 3, type: "VOCABULARY", order: 5, question: "What is the plural of 'mouse'?" },

            // English Starter - Unit 1 - Lesson 4: Pronouns (5 questions)
            { id: 16, lessonId: 4, type: "GRAMMAR", order: 1, question: "___ is my friend. (He/Him)" },
            { id: 17, lessonId: 4, type: "VOCABULARY", order: 2, question: "Which pronoun replaces 'Mary'?" },
            { id: 18, lessonId: 4, type: "LISTENING", order: 3, question: "Listen and identify the pronoun" },
            { id: 19, lessonId: 4, type: "READING", order: 4, question: "Read: 'They are students.' Who are students?" },
            { id: 20, lessonId: 4, type: "GRAMMAR", order: 5, question: "I gave ___ the book. (she/her)" },

            // English Starter - Unit 1 - Lesson 5: Basic Adjectives (5 questions)
            { id: 21, lessonId: 5, type: "VOCABULARY", order: 1, question: "What is the opposite of 'big'?" },
            { id: 22, lessonId: 5, type: "GRAMMAR", order: 2, question: "The ___ car is red. (beautiful/beautifully)" },
            { id: 23, lessonId: 5, type: "LISTENING", order: 3, question: "Listen and identify the adjective" },
            { id: 24, lessonId: 5, type: "READING", order: 4, question: "Read: 'The happy children play.' What describes children?" },
            { id: 25, lessonId: 5, type: "VOCABULARY", order: 5, question: "Which word describes color?" },

            // English Starter - Unit 2 - Lesson 6: Family & Friends (5 questions)
            { id: 26, lessonId: 6, type: "VOCABULARY", order: 1, question: "Your father's brother is your ___" },
            { id: 27, lessonId: 6, type: "LISTENING", order: 2, question: "Listen and identify the family member" },
            { id: 28, lessonId: 6, type: "READING", order: 3, question: "Read about Tom's family and answer" },
            { id: 29, lessonId: 6, type: "GRAMMAR", order: 4, question: "My ___ name is Sarah. (sister/sister's)" },
            { id: 30, lessonId: 6, type: "VOCABULARY", order: 5, question: "What do you call your mother's mother?" },

            // French Starter - Unit 7 - Lesson 31: Les Articles (5 questions)
            { id: 31, lessonId: 31, type: "GRAMMAR", order: 1, question: "Quel article utilise-t-on avec 'maison'?" },
            { id: 32, lessonId: 31, type: "VOCABULARY", order: 2, question: "Complétez: ___ chat (le/la)" },
            { id: 33, lessonId: 31, type: "LISTENING", order: 3, question: "Écoutez et choisissez l'article correct" },
            { id: 34, lessonId: 31, type: "READING", order: 4, question: "Lisez: '___ livre est intéressant.' Quel article?" },
            { id: 35, lessonId: 31, type: "GRAMMAR", order: 5, question: "Quand utilise-t-on 'des'?" },

            // French Starter - Unit 7 - Lesson 32: Être et Avoir (5 questions)
            { id: 36, lessonId: 32, type: "GRAMMAR", order: 1, question: "Je ___ français (suis/ai)" },
            { id: 37, lessonId: 32, type: "VOCABULARY", order: 2, question: "Conjuguez 'avoir' à la première personne" },
            { id: 38, lessonId: 32, type: "READING", order: 3, question: "Lisez: 'Elle est professeure.' Que signifie cela?" },
            { id: 39, lessonId: 32, type: "LISTENING", order: 4, question: "Écoutez et identifiez le verbe" },
            { id: 40, lessonId: 32, type: "GRAMMAR", order: 5, question: "Nous ___ une voiture (sommes/avons)" },

            // Spanish Starter - Unit 9 - Lesson 41: Los Artículos (5 questions)
            { id: 41, lessonId: 41, type: "GRAMMAR", order: 1, question: "¿Qué artículo se usa con 'casa'?" },
            { id: 42, lessonId: 41, type: "VOCABULARY", order: 2, question: "Complete: ___ perro (el/la)" },
            { id: 43, lessonId: 41, type: "LISTENING", order: 3, question: "Escuche y elija el artículo correcto" },
            { id: 44, lessonId: 41, type: "READING", order: 4, question: "Lea: '___ mesa es grande.' ¿Qué artículo?" },
            { id: 45, lessonId: 41, type: "GRAMMAR", order: 5, question: "¿Cuándo usamos 'unos'?" },

            // English 5.0 - Unit 3 - Lesson 11: Past Tenses (5 questions)
            { id: 51, lessonId: 11, type: "GRAMMAR", order: 1, question: "Yesterday, I ___ to the store." },
            { id: 52, lessonId: 11, type: "VOCABULARY", order: 2, question: "What is the past tense of 'go'?" },
            { id: 53, lessonId: 11, type: "LISTENING", order: 3, question: "Listen and identify the past tense verb" },
            { id: 54, lessonId: 11, type: "READING", order: 4, question: "Read: 'She finished her homework.' When did she finish?" },
            { id: 55, lessonId: 11, type: "GRAMMAR", order: 5, question: "They ___ the movie last night. (watch/watched)" },

            // English 5.0 - Unit 3 - Lesson 12: Future Forms (5 questions)
            { id: 56, lessonId: 12, type: "GRAMMAR", order: 1, question: "Tomorrow, I ___ visit my friend." },
            { id: 57, lessonId: 12, type: "VOCABULARY", order: 2, question: "Which expresses future: will/would?" },
            { id: 58, lessonId: 12, type: "LISTENING", order: 3, question: "Listen and identify the future form" },
            { id: 59, lessonId: 12, type: "READING", order: 4, question: "Read: 'I'm going to study.' What does this express?" },
            { id: 60, lessonId: 12, type: "GRAMMAR", order: 5, question: "She ___ arrive at 3 PM. (will/would)" },

            // English 5.0 - Unit 3 - Lesson 13: Modal Verbs (5 questions)
            { id: 61, lessonId: 13, type: "GRAMMAR", order: 1, question: "You ___ study harder. (should/would)" },
            { id: 62, lessonId: 13, type: "VOCABULARY", order: 2, question: "Which modal expresses ability?" },
            { id: 63, lessonId: 13, type: "LISTENING", order: 3, question: "Listen and identify the modal verb" },
            { id: 64, lessonId: 13, type: "READING", order: 4, question: "Read: 'I must finish this.' What does 'must' express?" },
            { id: 65, lessonId: 13, type: "GRAMMAR", order: 5, question: "___ you help me? (Can/Could)" },

            // English 5.0 - Unit 3 - Lesson 14: Perfect Tenses (5 questions)
            { id: 66, lessonId: 14, type: "GRAMMAR", order: 1, question: "I ___ lived here for 5 years." },
            { id: 67, lessonId: 14, type: "VOCABULARY", order: 2, question: "What is the past participle of 'eat'?" },
            { id: 68, lessonId: 14, type: "LISTENING", order: 3, question: "Listen and identify the perfect tense" },
            { id: 69, lessonId: 14, type: "READING", order: 4, question: "Read: 'She has finished.' When did she finish?" },
            { id: 70, lessonId: 14, type: "GRAMMAR", order: 5, question: "They ___ already left. (have/has)" },

            // English 5.0 - Unit 3 - Lesson 15: Comparative & Superlative (5 questions)
            { id: 71, lessonId: 15, type: "GRAMMAR", order: 1, question: "This book is ___ than that one." },
            { id: 72, lessonId: 15, type: "VOCABULARY", order: 2, question: "What is the superlative of 'good'?" },
            { id: 73, lessonId: 15, type: "LISTENING", order: 3, question: "Listen and identify the comparative form" },
            { id: 74, lessonId: 15, type: "READING", order: 4, question: "Read: 'The tallest building.' What does this mean?" },
            { id: 75, lessonId: 15, type: "GRAMMAR", order: 5, question: "She is the ___ student in class." },

            // English 5.0 - Unit 4 - Lesson 16: Short Stories (5 questions)
            { id: 76, lessonId: 16, type: "READING", order: 1, question: "Read the story. What is the main character's name?" },
            { id: 77, lessonId: 16, type: "VOCABULARY", order: 2, question: "In the story, what does 'brave' mean?" },
            { id: 78, lessonId: 16, type: "LISTENING", order: 3, question: "Listen to the story excerpt. What happened first?" },
            { id: 79, lessonId: 16, type: "READING", order: 4, question: "What is the moral of the story?" },
            { id: 80, lessonId: 16, type: "GRAMMAR", order: 5, question: "In 'He walked slowly,' what type of word is 'slowly'?" },

            // English 5.0 - Unit 4 - Lesson 17: News Articles (5 questions)
            { id: 81, lessonId: 17, type: "READING", order: 1, question: "Read the headline. What is the main topic?" },
            { id: 82, lessonId: 17, type: "VOCABULARY", order: 2, question: "What does 'breaking news' mean?" },
            { id: 83, lessonId: 17, type: "LISTENING", order: 3, question: "Listen to the news report. Where did the event happen?" },
            { id: 84, lessonId: 17, type: "READING", order: 4, question: "According to the article, when will the event occur?" },
            { id: 85, lessonId: 17, type: "GRAMMAR", order: 5, question: "In news writing, which tense is most common?" },

            // English 5.0 - Unit 4 - Lesson 18: Instructions (5 questions)
            { id: 86, lessonId: 18, type: "READING", order: 1, question: "Read the recipe. What is the first step?" },
            { id: 87, lessonId: 18, type: "VOCABULARY", order: 2, question: "What does 'preheat' mean in cooking?" },
            { id: 88, lessonId: 18, type: "LISTENING", order: 3, question: "Listen to the instructions. What tool do you need?" },
            { id: 89, lessonId: 18, type: "READING", order: 4, question: "How long should you cook the dish?" },
            { id: 90, lessonId: 18, type: "GRAMMAR", order: 5, question: "Instructions usually use which verb form?" },

            // English 5.0 - Unit 4 - Lesson 19: Advertisements (5 questions)
            { id: 91, lessonId: 19, type: "READING", order: 1, question: "Read the ad. What product is being sold?" },
            { id: 92, lessonId: 19, type: "VOCABULARY", order: 2, question: "What does 'limited time offer' mean?" },
            { id: 93, lessonId: 19, type: "LISTENING", order: 3, question: "Listen to the commercial. What is the discount?" },
            { id: 94, lessonId: 19, type: "READING", order: 4, question: "Where can you buy this product?" },
            { id: 95, lessonId: 19, type: "GRAMMAR", order: 5, question: "Ads often use which type of sentences?" },

            // English 5.0 - Unit 4 - Lesson 20: Letters & Emails (5 questions)
            { id: 96, lessonId: 20, type: "READING", order: 1, question: "Read the email. Who is the sender?" },
            { id: 97, lessonId: 20, type: "VOCABULARY", order: 2, question: "What does 'Dear Sir/Madam' indicate?" },
            { id: 98, lessonId: 20, type: "LISTENING", order: 3, question: "Listen to the voicemail. What is the purpose?" },
            { id: 99, lessonId: 20, type: "READING", order: 4, question: "How should you end a formal letter?" },
            { id: 100, lessonId: 20, type: "GRAMMAR", order: 5, question: "Formal emails use which tone?" },

            // English 6.0 - Unit 5 - Lesson 21: Conditional Sentences (5 questions)
            { id: 101, lessonId: 21, type: "GRAMMAR", order: 1, question: "If I ___ rich, I would travel the world." },
            { id: 102, lessonId: 21, type: "VOCABULARY", order: 2, question: "What type of conditional is 'If I were you...'?" },
            { id: 103, lessonId: 21, type: "LISTENING", order: 3, question: "Listen and identify the conditional type" },
            { id: 104, lessonId: 21, type: "READING", order: 4, question: "Read: 'If it rains, we'll stay home.' What does this mean?" },
            { id: 105, lessonId: 21, type: "GRAMMAR", order: 5, question: "If she ___ earlier, she wouldn't have been late." },

            // English 6.0 - Unit 5 - Lesson 22: Passive Voice (5 questions)
            { id: 106, lessonId: 22, type: "GRAMMAR", order: 1, question: "The book ___ by millions of people." },
            { id: 107, lessonId: 22, type: "VOCABULARY", order: 2, question: "What is the passive form of 'They built the house'?" },
            { id: 108, lessonId: 22, type: "LISTENING", order: 3, question: "Listen and identify the passive voice" },
            { id: 109, lessonId: 22, type: "READING", order: 4, question: "Read: 'The letter was written.' Who wrote it?" },
            { id: 110, lessonId: 22, type: "GRAMMAR", order: 5, question: "English ___ all over the world. (speak/is spoken)" },

            // English 6.0 - Unit 5 - Lesson 23: Reported Speech (5 questions)
            { id: 111, lessonId: 23, type: "GRAMMAR", order: 1, question: "She said she ___ tired." },
            { id: 112, lessonId: 23, type: "VOCABULARY", order: 2, question: "How do you report 'I am happy'?" },
            { id: 113, lessonId: 23, type: "LISTENING", order: 3, question: "Listen and identify the reported speech" },
            { id: 114, lessonId: 23, type: "READING", order: 4, question: "Read: 'He told me he would come.' What did he say?" },
            { id: 115, lessonId: 23, type: "GRAMMAR", order: 5, question: "They said they ___ the movie. (see/had seen)" },

            // English 6.0 - Unit 5 - Lesson 24: Relative Clauses (5 questions)
            { id: 116, lessonId: 24, type: "GRAMMAR", order: 1, question: "The man ___ lives next door is friendly." },
            { id: 117, lessonId: 24, type: "VOCABULARY", order: 2, question: "Which relative pronoun is for people?" },
            { id: 118, lessonId: 24, type: "LISTENING", order: 3, question: "Listen and identify the relative clause" },
            { id: 119, lessonId: 24, type: "READING", order: 4, question: "Read: 'The book that I read was good.' What does 'that' refer to?" },
            { id: 120, lessonId: 24, type: "GRAMMAR", order: 5, question: "This is the house ___ I was born. (where/which)" },

            // English 6.0 - Unit 5 - Lesson 25: Subjunctive Mood (5 questions)
            { id: 121, lessonId: 25, type: "GRAMMAR", order: 1, question: "I suggest that he ___ more careful." },
            { id: 122, lessonId: 25, type: "VOCABULARY", order: 2, question: "Which verb form follows 'I recommend that...'?" },
            { id: 123, lessonId: 25, type: "LISTENING", order: 3, question: "Listen and identify the subjunctive" },
            { id: 124, lessonId: 25, type: "READING", order: 4, question: "Read: 'It's important that she be here.' Why 'be'?" },
            { id: 125, lessonId: 25, type: "GRAMMAR", order: 5, question: "If I ___ you, I would study harder." },

            // English 6.0 - Unit 6 - Lesson 26: Business Writing (5 questions)
            { id: 126, lessonId: 26, type: "READING", order: 1, question: "Read the business letter. What is the purpose?" },
            { id: 127, lessonId: 26, type: "VOCABULARY", order: 2, question: "What does 'pursuant to' mean in business?" },
            { id: 128, lessonId: 26, type: "LISTENING", order: 3, question: "Listen to the business call. What is the main request?" },
            { id: 129, lessonId: 26, type: "READING", order: 4, question: "How should you address an unknown recipient?" },
            { id: 130, lessonId: 26, type: "GRAMMAR", order: 5, question: "Business writing should be: formal/informal?" },

            // English 6.0 - Unit 6 - Lesson 27: Presentations (5 questions)
            { id: 131, lessonId: 27, type: "READING", order: 1, question: "Read the presentation outline. What is the main topic?" },
            { id: 132, lessonId: 27, type: "VOCABULARY", order: 2, question: "What does 'in conclusion' signal?" },
            { id: 133, lessonId: 27, type: "LISTENING", order: 3, question: "Listen to the presentation. What is the speaker's main point?" },
            { id: 134, lessonId: 27, type: "READING", order: 4, question: "How should you start a presentation?" },
            { id: 135, lessonId: 27, type: "GRAMMAR", order: 5, question: "Presentations use which type of language?" },

            // English 6.0 - Unit 6 - Lesson 28: Academic English (5 questions)
            { id: 136, lessonId: 28, type: "READING", order: 1, question: "Read the academic abstract. What is the research about?" },
            { id: 137, lessonId: 28, type: "VOCABULARY", order: 2, question: "What does 'furthermore' indicate?" },
            { id: 138, lessonId: 28, type: "LISTENING", order: 3, question: "Listen to the lecture. What is the main argument?" },
            { id: 139, lessonId: 28, type: "READING", order: 4, question: "How do you cite sources in academic writing?" },
            { id: 140, lessonId: 28, type: "GRAMMAR", order: 5, question: "Academic writing avoids: contractions/full forms?" },

            // English 6.0 - Unit 6 - Lesson 29: Technical Writing (5 questions)
            { id: 141, lessonId: 29, type: "READING", order: 1, question: "Read the manual. What is step 1?" },
            { id: 142, lessonId: 29, type: "VOCABULARY", order: 2, question: "What does 'specifications' mean?" },
            { id: 143, lessonId: 29, type: "LISTENING", order: 3, question: "Listen to the technical explanation. What is the main process?" },
            { id: 144, lessonId: 29, type: "READING", order: 4, question: "How should technical instructions be written?" },
            { id: 145, lessonId: 29, type: "GRAMMAR", order: 5, question: "Technical writing uses: active/passive voice?" },

            // English 6.0 - Unit 6 - Lesson 30: Professional Communication (5 questions)
            { id: 146, lessonId: 30, type: "READING", order: 1, question: "Read the professional email. What is the tone?" },
            { id: 147, lessonId: 30, type: "VOCABULARY", order: 2, question: "What does 'I look forward to hearing from you' express?" },
            { id: 148, lessonId: 30, type: "LISTENING", order: 3, question: "Listen to the conference call. What is the decision?" },
            { id: 149, lessonId: 30, type: "READING", order: 4, question: "How do you politely disagree in professional settings?" },
            { id: 150, lessonId: 30, type: "GRAMMAR", order: 5, question: "Professional communication should be: direct/indirect?" },

            // Spanish Starter - Unit 9 - Lesson 42: Ser y Estar (5 questions)
            { id: 151, lessonId: 42, type: "GRAMMAR", order: 1, question: "Yo ___ estudiante (soy/estoy)" },
            { id: 152, lessonId: 42, type: "VOCABULARY", order: 2, question: "Conjugue 'estar' en primera persona" },
            { id: 153, lessonId: 42, type: "READING", order: 3, question: "Lea: 'Él es médico.' ¿Qué significa?" },
            { id: 154, lessonId: 42, type: "LISTENING", order: 4, question: "Escuche e identifique el verbo" },
            { id: 155, lessonId: 42, type: "GRAMMAR", order: 5, question: "La casa ___ grande (es/está)" },
        ]);

        await db.insert(schema.challengeOptions).values([
            // Challenge 1: Which article is used before a consonant sound?
            { id: 1, challengeId: 1, text: "a", correct: true },
            { id: 2, challengeId: 1, text: "an", correct: false },
            { id: 3, challengeId: 1, text: "the", correct: false },

            // Challenge 2: Complete: ___ apple (an/a)
            { id: 4, challengeId: 2, text: "an", correct: true },
            { id: 5, challengeId: 2, text: "a", correct: false },
            { id: 6, challengeId: 2, text: "the", correct: false },

            // Challenge 3: Listen and choose the correct article
            { id: 7, challengeId: 3, text: "a", correct: false, audioSrc: "/boy.mp3" },
            { id: 8, challengeId: 3, text: "an", correct: true, audioSrc: "/man.mp3" },
            { id: 9, challengeId: 3, text: "the", correct: false, audioSrc: "/woman.mp3" },

            // Challenge 4: Read: 'I have ___ book.' Choose the correct article.
            { id: 10, challengeId: 4, text: "a", correct: true },
            { id: 11, challengeId: 4, text: "an", correct: false },
            { id: 12, challengeId: 4, text: "the", correct: false },

            // Challenge 5: When do we use 'the'?
            { id: 13, challengeId: 5, text: "Before specific nouns", correct: true },
            { id: 14, challengeId: 5, text: "Before any noun", correct: false },
            { id: 15, challengeId: 5, text: "Before vowel sounds only", correct: false },

            // Challenge 6: She ___ to school every day.
            { id: 16, challengeId: 6, text: "goes", correct: true },
            { id: 17, challengeId: 6, text: "go", correct: false },
            { id: 18, challengeId: 6, text: "going", correct: false },

            // Challenge 7: What is the base form of 'goes'?
            { id: 19, challengeId: 7, text: "go", correct: true },
            { id: 20, challengeId: 7, text: "went", correct: false },
            { id: 21, challengeId: 7, text: "gone", correct: false },

            // Challenge 8: Read: 'I work in an office.' What does this mean?
            { id: 22, challengeId: 8, text: "I have a job in an office", correct: true },
            { id: 23, challengeId: 8, text: "I live in an office", correct: false },
            { id: 24, challengeId: 8, text: "I study in an office", correct: false },

            // Challenge 9: Listen and identify the present simple verb
            { id: 25, challengeId: 9, text: "work", correct: true, audioSrc: "/run.mp3" },
            { id: 26, challengeId: 9, text: "worked", correct: false, audioSrc: "/sit.mp3" },
            { id: 27, challengeId: 9, text: "working", correct: false, audioSrc: "/stand.mp3" },

            // Challenge 10: Do you ___ English? (speak/speaks)
            { id: 28, challengeId: 10, text: "speak", correct: true },
            { id: 29, challengeId: 10, text: "speaks", correct: false },
            { id: 30, challengeId: 10, text: "speaking", correct: false },

            // Challenge 11: What is the plural of 'child'?
            { id: 31, challengeId: 11, text: "children", correct: true },
            { id: 32, challengeId: 11, text: "childs", correct: false },
            { id: 33, challengeId: 11, text: "childrens", correct: false },

            // Challenge 12: Listen to the word and identify the noun
            { id: 34, challengeId: 12, text: "book", correct: true, audioSrc: "/sort.mp3" },
            { id: 35, challengeId: 12, text: "read", correct: false, audioSrc: "/shock.mp3" },
            { id: 36, challengeId: 12, text: "quickly", correct: false, audioSrc: "/short.mp3" },

            // Challenge 13: Which is countable: water/books?
            { id: 37, challengeId: 13, text: "books", correct: true },
            { id: 38, challengeId: 13, text: "water", correct: false },
            { id: 39, challengeId: 13, text: "both", correct: false },

            // Challenge 14: Read: 'The cats are sleeping.' How many cats?
            { id: 40, challengeId: 14, text: "More than one", correct: true },
            { id: 41, challengeId: 14, text: "One", correct: false },
            { id: 42, challengeId: 14, text: "Cannot tell", correct: false },

            // Challenge 15: What is the plural of 'mouse'?
            { id: 43, challengeId: 15, text: "mice", correct: true },
            { id: 44, challengeId: 15, text: "mouses", correct: false },
            { id: 45, challengeId: 15, text: "mouse", correct: false },

            // Challenge 16: ___ is my friend. (He/Him)
            { id: 46, challengeId: 16, text: "He", correct: true },
            { id: 47, challengeId: 16, text: "Him", correct: false },
            { id: 48, challengeId: 16, text: "His", correct: false },

            // Challenge 17: Which pronoun replaces 'Mary'?
            { id: 49, challengeId: 17, text: "She", correct: true },
            { id: 50, challengeId: 17, text: "He", correct: false },
            { id: 51, challengeId: 17, text: "It", correct: false },

            // Challenge 18: Listen and identify the pronoun
            { id: 52, challengeId: 18, text: "they", correct: true, audioSrc: "/you.mp3" },
            { id: 53, challengeId: 18, text: "them", correct: false, audioSrc: "/boy.mp3" },
            { id: 54, challengeId: 18, text: "their", correct: false, audioSrc: "/man.mp3" },

            // Challenge 19: Read: 'They are students.' Who are students?
            { id: 55, challengeId: 19, text: "Multiple people", correct: true },
            { id: 56, challengeId: 19, text: "One person", correct: false },
            { id: 57, challengeId: 19, text: "The speaker", correct: false },

            // Challenge 20: I gave ___ the book. (she/her)
            { id: 58, challengeId: 20, text: "her", correct: true },
            { id: 59, challengeId: 20, text: "she", correct: false },
            { id: 60, challengeId: 20, text: "hers", correct: false },

            // Challenge 21: What is the opposite of 'big'?
            { id: 61, challengeId: 21, text: "small", correct: true },
            { id: 62, challengeId: 21, text: "large", correct: false },
            { id: 63, challengeId: 21, text: "huge", correct: false },

            // Challenge 22: The ___ car is red. (beautiful/beautifully)
            { id: 64, challengeId: 22, text: "beautiful", correct: true },
            { id: 65, challengeId: 22, text: "beautifully", correct: false },
            { id: 66, challengeId: 22, text: "beauty", correct: false },

            // Challenge 23: Listen and identify the adjective
            { id: 67, challengeId: 23, text: "happy", correct: true, audioSrc: "/woman.mp3" },
            { id: 68, challengeId: 23, text: "quickly", correct: false, audioSrc: "/run.mp3" },
            { id: 69, challengeId: 23, text: "running", correct: false, audioSrc: "/sit.mp3" },

            // Challenge 24: Read: 'The happy children play.' What describes children?
            { id: 70, challengeId: 24, text: "happy", correct: true },
            { id: 71, challengeId: 24, text: "children", correct: false },
            { id: 72, challengeId: 24, text: "play", correct: false },

            // Challenge 25: Which word describes color?
            { id: 73, challengeId: 25, text: "red", correct: true },
            { id: 74, challengeId: 25, text: "quickly", correct: false },
            { id: 75, challengeId: 25, text: "running", correct: false },

            // Challenge 26: Your father's brother is your ___
            { id: 76, challengeId: 26, text: "uncle", correct: true },
            { id: 77, challengeId: 26, text: "cousin", correct: false },
            { id: 78, challengeId: 26, text: "nephew", correct: false },

            // Challenge 27: Listen and identify the family member
            { id: 79, challengeId: 27, text: "mother", correct: true, audioSrc: "/woman.mp3" },
            { id: 80, challengeId: 27, text: "father", correct: false, audioSrc: "/man.mp3" },
            { id: 81, challengeId: 27, text: "sister", correct: false, audioSrc: "/boy.mp3" },

            // Challenge 28: Read about Tom's family and answer
            { id: 82, challengeId: 28, text: "Tom has two sisters", correct: true },
            { id: 83, challengeId: 28, text: "Tom has one brother", correct: false },
            { id: 84, challengeId: 28, text: "Tom is an only child", correct: false },

            // Challenge 29: My ___ name is Sarah. (sister/sister's)
            { id: 85, challengeId: 29, text: "sister's", correct: true },
            { id: 86, challengeId: 29, text: "sister", correct: false },
            { id: 87, challengeId: 29, text: "sisters", correct: false },

            // Challenge 30: What do you call your mother's mother?
            { id: 88, challengeId: 30, text: "grandmother", correct: true },
            { id: 89, challengeId: 30, text: "aunt", correct: false },
            { id: 90, challengeId: 30, text: "mother-in-law", correct: false },

            // English 5.0 Challenge Options
            // Challenge 51: Yesterday, I ___ to the store.
            { id: 91, challengeId: 51, text: "went", correct: true },
            { id: 92, challengeId: 51, text: "go", correct: false },
            { id: 93, challengeId: 51, text: "going", correct: false },

            // Challenge 52: What is the past tense of 'go'?
            { id: 94, challengeId: 52, text: "went", correct: true },
            { id: 95, challengeId: 52, text: "gone", correct: false },
            { id: 96, challengeId: 52, text: "goes", correct: false },

            // Challenge 53: Listen and identify the past tense verb
            { id: 97, challengeId: 53, text: "walked", correct: true, audioSrc: "/walk.mp3" },
            { id: 98, challengeId: 53, text: "walk", correct: false, audioSrc: "/walking.mp3" },
            { id: 99, challengeId: 53, text: "walking", correct: false, audioSrc: "/walks.mp3" },

            // Challenge 54: Read: 'She finished her homework.' When did she finish?
            { id: 100, challengeId: 54, text: "In the past", correct: true },
            { id: 101, challengeId: 54, text: "Right now", correct: false },
            { id: 102, challengeId: 54, text: "In the future", correct: false },

            // Challenge 55: They ___ the movie last night. (watch/watched)
            { id: 103, challengeId: 55, text: "watched", correct: true },
            { id: 104, challengeId: 55, text: "watch", correct: false },
            { id: 105, challengeId: 55, text: "watching", correct: false },

            // Challenge 56: Tomorrow, I ___ visit my friend.
            { id: 106, challengeId: 56, text: "will", correct: true },
            { id: 107, challengeId: 56, text: "would", correct: false },
            { id: 108, challengeId: 56, text: "was", correct: false },

            // Challenge 57: Which expresses future: will/would?
            { id: 109, challengeId: 57, text: "will", correct: true },
            { id: 110, challengeId: 57, text: "would", correct: false },
            { id: 111, challengeId: 57, text: "both", correct: false },

            // Challenge 58: Listen and identify the future form
            { id: 112, challengeId: 58, text: "will go", correct: true, audioSrc: "/future.mp3" },
            { id: 113, challengeId: 58, text: "went", correct: false, audioSrc: "/past.mp3" },
            { id: 114, challengeId: 58, text: "going", correct: false, audioSrc: "/present.mp3" },

            // Challenge 59: Read: 'I'm going to study.' What does this express?
            { id: 115, challengeId: 59, text: "Future plan", correct: true },
            { id: 116, challengeId: 59, text: "Past action", correct: false },
            { id: 117, challengeId: 59, text: "Present action", correct: false },

            // Challenge 60: She ___ arrive at 3 PM. (will/would)
            { id: 118, challengeId: 60, text: "will", correct: true },
            { id: 119, challengeId: 60, text: "would", correct: false },
            { id: 120, challengeId: 60, text: "was", correct: false },

            // Challenge 61: You ___ study harder. (should/would)
            { id: 121, challengeId: 61, text: "should", correct: true },
            { id: 122, challengeId: 61, text: "would", correct: false },
            { id: 123, challengeId: 61, text: "will", correct: false },

            // Challenge 62: Which modal expresses ability?
            { id: 124, challengeId: 62, text: "can", correct: true },
            { id: 125, challengeId: 62, text: "must", correct: false },
            { id: 126, challengeId: 62, text: "should", correct: false },

            // Challenge 63: Listen and identify the modal verb
            { id: 127, challengeId: 63, text: "could", correct: true, audioSrc: "/modal.mp3" },
            { id: 128, challengeId: 63, text: "can", correct: false, audioSrc: "/ability.mp3" },
            { id: 129, challengeId: 63, text: "will", correct: false, audioSrc: "/future2.mp3" },

            // Challenge 64: Read: 'I must finish this.' What does 'must' express?
            { id: 130, challengeId: 64, text: "Obligation", correct: true },
            { id: 131, challengeId: 64, text: "Ability", correct: false },
            { id: 132, challengeId: 64, text: "Permission", correct: false },

            // Challenge 65: ___ you help me? (Can/Could)
            { id: 133, challengeId: 65, text: "Can", correct: true },
            { id: 134, challengeId: 65, text: "Could", correct: true },
            { id: 135, challengeId: 65, text: "Must", correct: false },

            // Challenge 66: I ___ lived here for 5 years.
            { id: 136, challengeId: 66, text: "have", correct: true },
            { id: 137, challengeId: 66, text: "has", correct: false },
            { id: 138, challengeId: 66, text: "had", correct: false },

            // Challenge 67: What is the past participle of 'eat'?
            { id: 139, challengeId: 67, text: "eaten", correct: true },
            { id: 140, challengeId: 67, text: "ate", correct: false },
            { id: 141, challengeId: 67, text: "eating", correct: false },

            // Challenge 68: Listen and identify the perfect tense
            { id: 142, challengeId: 68, text: "have done", correct: true, audioSrc: "/perfect.mp3" },
            { id: 143, challengeId: 68, text: "did", correct: false, audioSrc: "/simple.mp3" },
            { id: 144, challengeId: 68, text: "doing", correct: false, audioSrc: "/continuous.mp3" },

            // Challenge 69: Read: 'She has finished.' When did she finish?
            { id: 145, challengeId: 69, text: "Recently completed", correct: true },
            { id: 146, challengeId: 69, text: "Right now", correct: false },
            { id: 147, challengeId: 69, text: "Long ago", correct: false },

            // Challenge 70: They ___ already left. (have/has)
            { id: 148, challengeId: 70, text: "have", correct: true },
            { id: 149, challengeId: 70, text: "has", correct: false },
            { id: 150, challengeId: 70, text: "had", correct: false },
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

        // // Add vocabulary topics
        // await db.insert(schema.vocabularyTopics).values([
        //     {
        //         id: 1,
        //         title: "Technology",
        //         description: "Essential technology vocabulary",
        //         imageSrc: "/technology.svg", // You'll need to add this image
        //         createdAt: new Date(),
        //     },
        //     {
        //         id: 2,
        //         title: "Business",
        //         description: "Common business terminology",
        //         imageSrc: "/business.svg", // You'll need to add this image
        //         createdAt: new Date(),
        //     },
        //     {
        //         id: 3,
        //         title: "Science",
        //         description: "Scientific terms and concepts",
        //         imageSrc: "/science.svg", // You'll need to add this image
        //         createdAt: new Date(),
        //     },
        //     {
        //         id: 4,
        //         title: "Travel",
        //         description: "Essential travel vocabulary",
        //         imageSrc: "/travel.svg", // You'll need to add this image
        //         createdAt: new Date(),
        //     },
        // ]);

        // // Add technology vocabulary words
        // await db.insert(schema.vocabularyWords).values([
        //     { id: 1, topicId: 1, word: "algorithm", vietnameseMeaning: "thuật toán", createdAt: new Date() },
        //     { id: 2, topicId: 1, word: "bandwidth", vietnameseMeaning: "băng thông", createdAt: new Date() },
        //     { id: 3, topicId: 1, word: "cloud", vietnameseMeaning: "đám mây", createdAt: new Date() },
        //     { id: 4, topicId: 1, word: "database", vietnameseMeaning: "cơ sở dữ liệu", createdAt: new Date() },
        //     { id: 5, topicId: 1, word: "encryption", vietnameseMeaning: "mã hóa", createdAt: new Date() },
        //     { id: 6, topicId: 1, word: "firewall", vietnameseMeaning: "tường lửa", createdAt: new Date() },
        //     { id: 7, topicId: 1, word: "hardware", vietnameseMeaning: "phần cứng", createdAt: new Date() },
        //     { id: 8, topicId: 1, word: "interface", vietnameseMeaning: "giao diện", createdAt: new Date() },
        //     { id: 9, topicId: 1, word: "javascript", vietnameseMeaning: "ngôn ngữ javascript", createdAt: new Date() },
        //     { id: 10, topicId: 1, word: "kernel", vietnameseMeaning: "nhân hệ thống", createdAt: new Date() },
        //     { id: 11, topicId: 1, word: "latency", vietnameseMeaning: "độ trễ", createdAt: new Date() },
        //     { id: 12, topicId: 1, word: "malware", vietnameseMeaning: "phần mềm độc hại", createdAt: new Date() },
        // ]);

        // // Add business vocabulary words
        // await db.insert(schema.vocabularyWords).values([
        //     { id: 13, topicId: 2, word: "acquisition", vietnameseMeaning: "sự mua lại", createdAt: new Date() },
        //     { id: 14, topicId: 2, word: "budget", vietnameseMeaning: "ngân sách", createdAt: new Date() },
        //     { id: 15, topicId: 2, word: "corporation", vietnameseMeaning: "tập đoàn", createdAt: new Date() },
        //     { id: 16, topicId: 2, word: "dividend", vietnameseMeaning: "cổ tức", createdAt: new Date() },
        //     { id: 17, topicId: 2, word: "entrepreneur", vietnameseMeaning: "doanh nhân", createdAt: new Date() },
        //     { id: 18, topicId: 2, word: "franchise", vietnameseMeaning: "nhượng quyền", createdAt: new Date() },
        //     { id: 19, topicId: 2, word: "investment", vietnameseMeaning: "đầu tư", createdAt: new Date() },
        //     { id: 20, topicId: 2, word: "liability", vietnameseMeaning: "trách nhiệm pháp lý", createdAt: new Date() },
        // ]);

        // // Add science vocabulary words
        // await db.insert(schema.vocabularyWords).values([
        //     { id: 21, topicId: 3, word: "atom", vietnameseMeaning: "nguyên tử", createdAt: new Date() },
        //     { id: 22, topicId: 3, word: "biology", vietnameseMeaning: "sinh học", createdAt: new Date() },
        //     { id: 23, topicId: 3, word: "chemistry", vietnameseMeaning: "hóa học", createdAt: new Date() },
        //     { id: 24, topicId: 3, word: "ecosystem", vietnameseMeaning: "hệ sinh thái", createdAt: new Date() },
        //     { id: 25, topicId: 3, word: "gravity", vietnameseMeaning: "trọng lực", createdAt: new Date() },
        //     { id: 26, topicId: 3, word: "hypothesis", vietnameseMeaning: "giả thuyết", createdAt: new Date() },
        //     { id: 27, topicId: 3, word: "molecule", vietnameseMeaning: "phân tử", createdAt: new Date() },
        //     { id: 28, topicId: 3, word: "physics", vietnameseMeaning: "vật lý học", createdAt: new Date() },
        // ]);

        // // Add travel vocabulary words
        // await db.insert(schema.vocabularyWords).values([
        //     { id: 29, topicId: 4, word: "accommodation", vietnameseMeaning: "chỗ ở", createdAt: new Date() },
        //     { id: 30, topicId: 4, word: "destination", vietnameseMeaning: "điểm đến", createdAt: new Date() },
        //     { id: 31, topicId: 4, word: "itinerary", vietnameseMeaning: "lịch trình", createdAt: new Date() },
        //     { id: 32, topicId: 4, word: "luggage", vietnameseMeaning: "hành lý", createdAt: new Date() },
        //     { id: 33, topicId: 4, word: "passport", vietnameseMeaning: "hộ chiếu", createdAt: new Date() },
        //     { id: 34, topicId: 4, word: "reservation", vietnameseMeaning: "đặt chỗ", createdAt: new Date() },
        //     { id: 35, topicId: 4, word: "tourism", vietnameseMeaning: "du lịch", createdAt: new Date() },
        //     { id: 36, topicId: 4, word: "visa", vietnameseMeaning: "thị thực", createdAt: new Date() },
        // ]);

        console.log("Seeding finished");
    }
    catch (error) {
        console.error(error);
        throw new Error("Failed to seed the database");
    }
};

main();
