import { neon } from "@neondatabase/serverless";
import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const fixSequences = async () => {
    try {
        console.log("Fixing database sequences...");
        
        // Fix courses sequence
        await sql`SELECT setval('courses_id_seq', COALESCE((SELECT MAX(id) FROM courses), 0) + 1, false);`;
        console.log("✅ Fixed courses sequence");
        
        // Fix units sequence
        await sql`SELECT setval('units_id_seq', COALESCE((SELECT MAX(id) FROM units), 0) + 1, false);`;
        console.log("✅ Fixed units sequence");
        
        // Fix lessons sequence
        await sql`SELECT setval('lessons_id_seq', COALESCE((SELECT MAX(id) FROM lessons), 0) + 1, false);`;
        console.log("✅ Fixed lessons sequence");
        
        // Fix challenges sequence
        await sql`SELECT setval('challenges_id_seq', COALESCE((SELECT MAX(id) FROM challenges), 0) + 1, false);`;
        console.log("✅ Fixed challenges sequence");
        
        // Fix challenge_options sequence
        await sql`SELECT setval('challenge_options_id_seq', COALESCE((SELECT MAX(id) FROM challenge_options), 0) + 1, false);`;
        console.log("✅ Fixed challenge_options sequence");
        
        // Fix tests sequence
        await sql`SELECT setval('tests_id_seq', COALESCE((SELECT MAX(id) FROM tests), 0) + 1, false);`;
        console.log("✅ Fixed tests sequence");
        
        // Fix test_questions sequence
        await sql`SELECT setval('test_questions_id_seq', COALESCE((SELECT MAX(id) FROM test_questions), 0) + 1, false);`;
        console.log("✅ Fixed test_questions sequence");
        
        // Fix test_options sequence
        await sql`SELECT setval('test_options_id_seq', COALESCE((SELECT MAX(id) FROM test_options), 0) + 1, false);`;
        console.log("✅ Fixed test_options sequence");
        
        // Fix vocabulary_topics sequence
        await sql`SELECT setval('vocabulary_topics_id_seq', COALESCE((SELECT MAX(id) FROM vocabulary_topics), 0) + 1, false);`;
        console.log("✅ Fixed vocabulary_topics sequence");
        
        // Fix vocabulary_words sequence
        await sql`SELECT setval('vocabulary_words_id_seq', COALESCE((SELECT MAX(id) FROM vocabulary_words), 0) + 1, false);`;
        console.log("✅ Fixed vocabulary_words sequence");
        
        // Fix user_subscription sequence
        await sql`SELECT setval('user_subscription_id_seq', COALESCE((SELECT MAX(id) FROM user_subscription), 0) + 1, false);`;
        console.log("✅ Fixed user_subscription sequence");
        
        console.log("🎉 All sequences fixed successfully!");
        
    } catch (error) {
        console.error("❌ Error fixing sequences:", error);
        process.exit(1);
    }
};

fixSequences();
