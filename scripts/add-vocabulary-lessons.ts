import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const addVocabularyLessons = async () => {
    try {
        console.log("Adding vocabulary lessons for French and Spanish...");
        
        // Get all French and Spanish lessons that don't have challenges yet
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
        
        // FRENCH VOCABULARY LESSONS
        const frenchVocabChallenges = [
            // Les Pronoms
            {
                lessonTitle: "Les Pronoms",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "Quel pronom personnel pour 'Marie'?",
                        options: [
                            { text: "elle", correct: true },
                            { text: "il", correct: false },
                            { text: "ils", correct: false },
                            { text: "elles", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Complétez: ___ parlons français (nous)",
                        options: [
                            { text: "Nous", correct: true },
                            { text: "Vous", correct: false },
                            { text: "Ils", correct: false },
                            { text: "Je", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Quel pronom pour remplacer 'les livres'?",
                        options: [
                            { text: "ils", correct: true },
                            { text: "elles", correct: false },
                            { text: "il", correct: false },
                            { text: "elle", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Que signifie 'vous' en anglais?",
                        options: [
                            { text: "you (formal/plural)", correct: true },
                            { text: "we", correct: false },
                            { text: "they", correct: false },
                            { text: "I", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Complétez: ___ êtes français (vous)",
                        options: [
                            { text: "Vous", correct: true },
                            { text: "Tu", correct: false },
                            { text: "Nous", correct: false },
                            { text: "Ils", correct: false }
                        ]
                    }
                ]
            },
            // Les Adjectifs
            {
                lessonTitle: "Les Adjectifs",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "Accordez: Une voiture ___ (rouge)",
                        options: [
                            { text: "rouge", correct: true },
                            { text: "rouges", correct: false },
                            { text: "rougee", correct: false },
                            { text: "rougees", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Comment dit-on 'beautiful' au féminin?",
                        options: [
                            { text: "belle", correct: true },
                            { text: "beau", correct: false },
                            { text: "beaux", correct: false },
                            { text: "belles", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Accordez: Des maisons ___ (grand)",
                        options: [
                            { text: "grandes", correct: true },
                            { text: "grand", correct: false },
                            { text: "grande", correct: false },
                            { text: "grands", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Que signifie 'petit'?",
                        options: [
                            { text: "small", correct: true },
                            { text: "big", correct: false },
                            { text: "tall", correct: false },
                            { text: "short", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Placez l'adjectif: ___ homme ___ (vieux)",
                        options: [
                            { text: "Un vieil homme", correct: true },
                            { text: "Un homme vieux", correct: false },
                            { text: "Un vieux homme", correct: false },
                            { text: "Un homme vieil", correct: false }
                        ]
                    }
                ]
            },
            // La Famille
            {
                lessonTitle: "La Famille",
                challenges: [
                    {
                        type: "VOCABULARY",
                        order: 1,
                        question: "Comment dit-on 'mother' en français?",
                        options: [
                            { text: "mère", correct: true },
                            { text: "père", correct: false },
                            { text: "sœur", correct: false },
                            { text: "fille", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Que signifie 'grand-père'?",
                        options: [
                            { text: "grandfather", correct: true },
                            { text: "father", correct: false },
                            { text: "uncle", correct: false },
                            { text: "brother", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 3,
                        question: "Comment dit-on 'children' en français?",
                        options: [
                            { text: "enfants", correct: true },
                            { text: "parents", correct: false },
                            { text: "adultes", correct: false },
                            { text: "bébés", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "Que signifie 'belle-mère'?",
                        options: [
                            { text: "mother-in-law/stepmother", correct: true },
                            { text: "beautiful mother", correct: false },
                            { text: "grandmother", correct: false },
                            { text: "aunt", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 5,
                        question: "Comment dit-on 'cousin' (féminin)?",
                        options: [
                            { text: "cousine", correct: true },
                            { text: "cousin", correct: false },
                            { text: "sœur", correct: false },
                            { text: "nièce", correct: false }
                        ]
                    }
                ]
            }
        ];
        
        // SPANISH VOCABULARY LESSONS
        const spanishVocabChallenges = [
            // Los Pronombres
            {
                lessonTitle: "Los Pronombres",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "¿Qué pronombre personal para 'María'?",
                        options: [
                            { text: "ella", correct: true },
                            { text: "él", correct: false },
                            { text: "ellos", correct: false },
                            { text: "ellas", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "Complete: ___ hablamos español (nosotros)",
                        options: [
                            { text: "Nosotros", correct: true },
                            { text: "Ustedes", correct: false },
                            { text: "Ellos", correct: false },
                            { text: "Yo", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "¿Qué pronombre para reemplazar 'los libros'?",
                        options: [
                            { text: "ellos", correct: true },
                            { text: "ellas", correct: false },
                            { text: "él", correct: false },
                            { text: "ella", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "¿Qué significa 'ustedes' en inglés?",
                        options: [
                            { text: "you (plural/formal)", correct: true },
                            { text: "we", correct: false },
                            { text: "they", correct: false },
                            { text: "I", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "Complete: ___ son estudiantes (ellos)",
                        options: [
                            { text: "Ellos", correct: true },
                            { text: "Tú", correct: false },
                            { text: "Nosotros", correct: false },
                            { text: "Ustedes", correct: false }
                        ]
                    }
                ]
            },
            // Los Adjetivos
            {
                lessonTitle: "Los Adjetivos",
                challenges: [
                    {
                        type: "GRAMMAR",
                        order: 1,
                        question: "Concuerde: Una casa ___ (grande)",
                        options: [
                            { text: "grande", correct: true },
                            { text: "grandes", correct: false },
                            { text: "granda", correct: false },
                            { text: "grandas", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "¿Cómo se dice 'beautiful' en femenino?",
                        options: [
                            { text: "hermosa", correct: true },
                            { text: "hermoso", correct: false },
                            { text: "hermosos", correct: false },
                            { text: "hermosas", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 3,
                        question: "Concuerde: Unos coches ___ (rojo)",
                        options: [
                            { text: "rojos", correct: true },
                            { text: "rojo", correct: false },
                            { text: "roja", correct: false },
                            { text: "rojas", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "¿Qué significa 'pequeño'?",
                        options: [
                            { text: "small", correct: true },
                            { text: "big", correct: false },
                            { text: "tall", correct: false },
                            { text: "short", correct: false }
                        ]
                    },
                    {
                        type: "GRAMMAR",
                        order: 5,
                        question: "¿Cuál es el superlativo de 'bueno'?",
                        options: [
                            { text: "el mejor", correct: true },
                            { text: "más bueno", correct: false },
                            { text: "muy bueno", correct: false },
                            { text: "buenísimo", correct: false }
                        ]
                    }
                ]
            },
            // La Familia
            {
                lessonTitle: "La Familia",
                challenges: [
                    {
                        type: "VOCABULARY",
                        order: 1,
                        question: "¿Cómo se dice 'mother' en español?",
                        options: [
                            { text: "madre", correct: true },
                            { text: "padre", correct: false },
                            { text: "hermana", correct: false },
                            { text: "hija", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 2,
                        question: "¿Qué significa 'abuelo'?",
                        options: [
                            { text: "grandfather", correct: true },
                            { text: "father", correct: false },
                            { text: "uncle", correct: false },
                            { text: "brother", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 3,
                        question: "¿Cómo se dice 'children' en español?",
                        options: [
                            { text: "niños/hijos", correct: true },
                            { text: "padres", correct: false },
                            { text: "adultos", correct: false },
                            { text: "bebés", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 4,
                        question: "¿Qué significa 'suegra'?",
                        options: [
                            { text: "mother-in-law", correct: true },
                            { text: "stepmother", correct: false },
                            { text: "grandmother", correct: false },
                            { text: "aunt", correct: false }
                        ]
                    },
                    {
                        type: "VOCABULARY",
                        order: 5,
                        question: "¿Cómo se dice 'cousin' (femenino)?",
                        options: [
                            { text: "prima", correct: true },
                            { text: "primo", correct: false },
                            { text: "hermana", correct: false },
                            { text: "sobrina", correct: false }
                        ]
                    }
                ]
            }
        ];
        
        // Add French vocabulary challenges
        console.log("Adding French vocabulary challenges...");
        for (const lessonData of frenchVocabChallenges) {
            const lesson = frenchLessons.find(l => l.title === lessonData.lessonTitle);
            if (lesson) {
                console.log(`Adding challenges for French lesson: ${lesson.title}`);
                
                for (const challengeData of lessonData.challenges) {
                    const challenge = await db.insert(schema.challenges).values({
                        lessonId: lesson.id,
                        type: challengeData.type as any,
                        order: challengeData.order,
                        question: challengeData.question
                    }).returning();
                    
                    const options = challengeData.options.map(option => ({
                        challengeId: challenge[0].id,
                        text: option.text,
                        correct: option.correct
                    }));
                    
                    await db.insert(schema.challengeOptions).values(options);
                }
            }
        }
        
        // Add Spanish vocabulary challenges
        console.log("Adding Spanish vocabulary challenges...");
        for (const lessonData of spanishVocabChallenges) {
            const lesson = spanishLessons.find(l => l.title === lessonData.lessonTitle);
            if (lesson) {
                console.log(`Adding challenges for Spanish lesson: ${lesson.title}`);
                
                for (const challengeData of lessonData.challenges) {
                    const challenge = await db.insert(schema.challenges).values({
                        lessonId: lesson.id,
                        type: challengeData.type as any,
                        order: challengeData.order,
                        question: challengeData.question
                    }).returning();
                    
                    const options = challengeData.options.map(option => ({
                        challengeId: challenge[0].id,
                        text: option.text,
                        correct: option.correct
                    }));
                    
                    await db.insert(schema.challengeOptions).values(options);
                }
            }
        }
        
        console.log("✅ All vocabulary lessons added successfully!");
        
    } catch (error) {
        console.error("❌ Error adding vocabulary lessons:", error);
        process.exit(1);
    }
};

addVocabularyLessons();
