import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const checkFrenchSpanish = async () => {
    try {
        console.log("Checking French and Spanish course content...");
        
        // Get French course content
        console.log("\n=== FRENCH COURSE ===");
        const frenchCourse = await sql`SELECT * FROM courses WHERE title = 'French Starter'`;
        console.log("French course:", frenchCourse[0]);
        
        const frenchUnits = await sql`SELECT * FROM units WHERE course_id = ${frenchCourse[0].id} ORDER BY "order"`;
        console.log("French units:", frenchUnits);
        
        for (const unit of frenchUnits) {
            console.log(`\nUnit: ${unit.title}`);
            const lessons = await sql`SELECT * FROM lessons WHERE unit_id = ${unit.id} ORDER BY "order"`;
            console.log("Lessons:", lessons.map(l => l.title));
            
            for (const lesson of lessons) {
                const challenges = await sql`SELECT * FROM challenges WHERE lesson_id = ${lesson.id} ORDER BY "order"`;
                console.log(`  ${lesson.title}: ${challenges.length} challenges`);
                if (challenges.length > 0) {
                    console.log("    Questions:", challenges.map(c => c.question));
                }
            }
        }
        
        // Get Spanish course content
        console.log("\n=== SPANISH COURSE ===");
        const spanishCourse = await sql`SELECT * FROM courses WHERE title = 'Spanish Starter'`;
        console.log("Spanish course:", spanishCourse[0]);
        
        const spanishUnits = await sql`SELECT * FROM units WHERE course_id = ${spanishCourse[0].id} ORDER BY "order"`;
        console.log("Spanish units:", spanishUnits);
        
        for (const unit of spanishUnits) {
            console.log(`\nUnit: ${unit.title}`);
            const lessons = await sql`SELECT * FROM lessons WHERE unit_id = ${unit.id} ORDER BY "order"`;
            console.log("Lessons:", lessons.map(l => l.title));
            
            for (const lesson of lessons) {
                const challenges = await sql`SELECT * FROM challenges WHERE lesson_id = ${lesson.id} ORDER BY "order"`;
                console.log(`  ${lesson.title}: ${challenges.length} challenges`);
                if (challenges.length > 0) {
                    console.log("    Questions:", challenges.map(c => c.question));
                }
            }
        }
        
    } catch (error) {
        console.error("Error checking French/Spanish content:", error);
    }
};

checkFrenchSpanish();
