import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const addFrenchSpanishQuestions = async () => {
    try {
        console.log("Adding comprehensive French and Spanish questions...");

        // Get lesson IDs for French and Spanish courses
        const frenchLessons = await sql`
            SELECT l.id, l.title, u.title as unit_title 
            FROM lessons l 
            JOIN units u ON l.unit_id = u.id 
            WHERE u.course_id = 4 AND u.title != 'Practice Exercises'
            ORDER BY u.order, l.order
        `;

        const spanishLessons = await sql`
            SELECT l.id, l.title, u.title as unit_title 
            FROM lessons l 
            JOIN units u ON l.unit_id = u.id 
            WHERE u.course_id = 5 AND u.title != 'Practice Exercises'
            ORDER BY u.order, l.order
        `;

        console.log("French lessons:", frenchLessons);
        console.log("Spanish lessons:", spanishLessons);

        // Clear existing challenges for these lessons (except practice exercises)
        for (const lesson of frenchLessons) {
            await sql`DELETE FROM challenge_options WHERE challenge_id IN (SELECT id FROM challenges WHERE lesson_id = ${lesson.id})`;
            await sql`DELETE FROM challenges WHERE lesson_id = ${lesson.id}`;
        }

        for (const lesson of spanishLessons) {
            await sql`DELETE FROM challenge_options WHERE challenge_id IN (SELECT id FROM challenges WHERE lesson_id = ${lesson.id})`;
            await sql`DELETE FROM challenges WHERE lesson_id = ${lesson.id}`;
        }

        // FRENCH QUESTIONS
        console.log("\nAdding French questions...");

        // French - Les Bases Unit
        const frenchChallenges = [
            // Les Articles (lesson 1)
            {
                lessonTitle: "Les Articles",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "Quel article utilise-t-on avec 'maison' (féminin)?",
                        options: [
                            { text: "la", correct: true },
                            { text: "le", correct: false },
                            { text: "les", correct: false },
                            { text: "l'", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Complétez: ___ chat (masculin)",
                        options: [
                            { text: "le", correct: true },
                            { text: "la", correct: false },
                            { text: "les", correct: false },
                            { text: "un", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Choisissez l'article indéfini pluriel:",
                        options: [
                            { text: "des", correct: true },
                            { text: "les", correct: false },
                            { text: "un", correct: false },
                            { text: "une", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Quel article contracté pour 'de + le'?",
                        options: [
                            { text: "du", correct: true },
                            { text: "de la", correct: false },
                            { text: "des", correct: false },
                            { text: "de l'", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Complétez: Je vais ___ école (à + le)",
                        options: [
                            { text: "à l'", correct: true },
                            { text: "au", correct: false },
                            { text: "à la", correct: false },
                            { text: "aux", correct: false }
                        ]
                    }
                ]
            },
            // Être et Avoir (lesson 2)
            {
                lessonTitle: "Être et Avoir",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "Je ___ français(e)",
                        options: [
                            { text: "suis", correct: true },
                            { text: "es", correct: false },
                            { text: "est", correct: false },
                            { text: "ai", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Nous ___ une voiture",
                        options: [
                            { text: "avons", correct: true },
                            { text: "sommes", correct: false },
                            { text: "êtes", correct: false },
                            { text: "ont", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Elle ___ professeure (profession)",
                        options: [
                            { text: "est", correct: true },
                            { text: "a", correct: false },
                            { text: "être", correct: false },
                            { text: "avoir", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Vous ___ vingt ans",
                        options: [
                            { text: "avez", correct: true },
                            { text: "êtes", correct: false },
                            { text: "sont", correct: false },
                            { text: "as", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Ils ___ à Paris (location)",
                        options: [
                            { text: "sont", correct: true },
                            { text: "ont", correct: false },
                            { text: "être", correct: false },
                            { text: "avoir", correct: false }
                        ]
                    }
                ]
            },
            // Les Nombres (lesson 3)
            {
                lessonTitle: "Les Nombres",
                challenges: [
                    {
                        type: "VOCABULARY",
                        order: 1,
                        question: "Comment dit-on '15' en français?",
                        options: [
                            { text: "quinze", correct: true },
                            { text: "quatorze", correct: false },
                            { text: "seize", correct: false },
                            { text: "dix-cinq", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Quel est le nombre '71'?",
                        options: [
                            { text: "soixante et onze", correct: true },
                            { text: "soixante-onze", correct: false },
                            { text: "septante et un", correct: false },
                            { text: "soixante-dix-un", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 3,
                        question: "Comment écrit-on '80'?",
                        options: [
                            { text: "quatre-vingts", correct: true },
                            { text: "huitante", correct: false },
                            { text: "octante", correct: false },
                            { text: "quatre-vingt", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Que signifie 'mille'?",
                        options: [
                            { text: "1000", correct: true },
                            { text: "100", correct: false },
                            { text: "10000", correct: false },
                            { text: "1000000", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Complétez: J'ai ___ euros (21)",
                        options: [
                            { text: "vingt et un", correct: true },
                            { text: "vingt-et-un", correct: false },
                            { text: "vingt-un", correct: false },
                            { text: "vingts et un", correct: false }
                        ]
                    }
                ]
            }
        ];

        // Add French challenges
        for (const lessonData of frenchChallenges) {
            const lesson = frenchLessons.find(l => l.title === lessonData.lessonTitle);
            if (lesson) {
                console.log(`Adding challenges for French lesson: ${lesson.title}`);

                for (const challengeData of lessonData.challenges) {
                    // Insert challenge
                    const challenge = await db.insert(schema.challenges).values({
                        lessonId: lesson.id,
                        type: challengeData.type as any,
                        order: challengeData.order,
                        question: challengeData.question
                    }).returning();

                    // Insert challenge options
                    const options = challengeData.options.map(option => ({
                        challengeId: challenge[0].id,
                        text: option.text,
                        correct: option.correct
                    }));

                    await db.insert(schema.challengeOptions).values(options);
                }
            }
        }

        console.log("✅ French questions added successfully!");

        // SPANISH QUESTIONS
        console.log("\nAdding Spanish questions...");

        const spanishChallenges = [
            // Los Artículos (lesson 1)
            {
                lessonTitle: "Los Artículos",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "¿Qué artículo se usa con 'casa' (femenino)?",
                        options: [
                            { text: "la", correct: true },
                            { text: "el", correct: false },
                            { text: "los", correct: false },
                            { text: "las", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Complete: ___ perro (masculino)",
                        options: [
                            { text: "el", correct: true },
                            { text: "la", correct: false },
                            { text: "los", correct: false },
                            { text: "un", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Elija el artículo indefinido plural:",
                        options: [
                            { text: "unos/unas", correct: true },
                            { text: "los/las", correct: false },
                            { text: "un/una", correct: false },
                            { text: "el/la", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "¿Qué artículo contracto para 'de + el'?",
                        options: [
                            { text: "del", correct: true },
                            { text: "de la", correct: false },
                            { text: "de los", correct: false },
                            { text: "de las", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Complete: Voy ___ colegio (a + el)",
                        options: [
                            { text: "al", correct: true },
                            { text: "a la", correct: false },
                            { text: "a los", correct: false },
                            { text: "a las", correct: false }
                        ]
                    }
                ]
            },
            // Ser y Estar (lesson 2)
            {
                lessonTitle: "Ser y Estar",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "Yo ___ estudiante (profesión)",
                        options: [
                            { text: "soy", correct: true },
                            { text: "estoy", correct: false },
                            { text: "eres", correct: false },
                            { text: "está", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "La casa ___ grande (característica)",
                        options: [
                            { text: "es", correct: true },
                            { text: "está", correct: false },
                            { text: "son", correct: false },
                            { text: "están", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Nosotros ___ en Madrid (ubicación)",
                        options: [
                            { text: "estamos", correct: true },
                            { text: "somos", correct: false },
                            { text: "están", correct: false },
                            { text: "son", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Ella ___ contenta hoy (estado temporal)",
                        options: [
                            { text: "está", correct: true },
                            { text: "es", correct: false },
                            { text: "estás", correct: false },
                            { text: "eres", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Ellos ___ médicos (profesión)",
                        options: [
                            { text: "son", correct: true },
                            { text: "están", correct: false },
                            { text: "es", correct: false },
                            { text: "está", correct: false }
                        ]
                    }
                ]
            },
            // Los Números (lesson 3)
            {
                lessonTitle: "Los Números",
                challenges: [
                    {
                        type: "VOCABULARY",
                        order: 1,
                        question: "¿Cómo se dice '15' en español?",
                        options: [
                            { text: "quince", correct: true },
                            { text: "catorce", correct: false },
                            { text: "dieciséis", correct: false },
                            { text: "diez y cinco", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "¿Cuál es el número '30'?",
                        options: [
                            { text: "treinta", correct: true },
                            { text: "trece", correct: false },
                            { text: "tres", correct: false },
                            { text: "trescientos", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 3,
                        question: "¿Cómo se escribe '100'?",
                        options: [
                            { text: "cien", correct: true },
                            { text: "ciento", correct: false },
                            { text: "diez", correct: false },
                            { text: "mil", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "¿Qué significa 'mil'?",
                        options: [
                            { text: "1000", correct: true },
                            { text: "100", correct: false },
                            { text: "10000", correct: false },
                            { text: "1000000", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Complete: Tengo ___ años (21)",
                        options: [
                            { text: "veintiún", correct: true },
                            { text: "veinte y uno", correct: false },
                            { text: "veintiuno", correct: false },
                            { text: "veintiunos", correct: false }
                        ]
                    }
                ]
            }
        ];

        // Add Spanish challenges
        for (const lessonData of spanishChallenges) {
            const lesson = spanishLessons.find(l => l.title === lessonData.lessonTitle);
            if (lesson) {
                console.log(`Adding challenges for Spanish lesson: ${lesson.title}`);

                for (const challengeData of lessonData.challenges) {
                    // Insert challenge
                    const challenge = await db.insert(schema.challenges).values({
                        lessonId: lesson.id,
                        type: challengeData.type as any,
                        order: challengeData.order,
                        question: challengeData.question
                    }).returning();

                    // Insert challenge options
                    const options = challengeData.options.map(option => ({
                        challengeId: challenge[0].id,
                        text: option.text,
                        correct: option.correct
                    }));

                    await db.insert(schema.challengeOptions).values(options);
                }
            }
        }

        console.log("✅ Spanish questions added successfully!");
        console.log("🎉 All French and Spanish questions have been added!");

    } catch (error) {
        console.error("❌ Error adding French/Spanish questions:", error);
        process.exit(1);
    }
};

addFrenchSpanishQuestions();
