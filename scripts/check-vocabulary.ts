import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const checkVocabulary = async () => {
    try {
        console.log("Checking vocabulary topics...");
        
        const topics = await sql`SELECT * FROM vocabulary_topics ORDER BY id`;
        console.log("Vocabulary topics:", topics);
        
        console.log("\nChecking vocabulary words...");
        const words = await sql`SELECT topic_id, COUNT(*) as word_count FROM vocabulary_words GROUP BY topic_id ORDER BY topic_id`;
        console.log("Word counts by topic:", words);
        
        // Check for technology topic specifically
        const techTopic = await sql`SELECT * FROM vocabulary_topics WHERE title ILIKE '%technology%' OR title ILIKE '%tech%'`;
        if (techTopic.length > 0) {
            console.log("\nTechnology topic found:", techTopic[0]);
            const techWords = await sql`SELECT COUNT(*) as count FROM vocabulary_words WHERE topic_id = ${techTopic[0].id}`;
            console.log("Technology words count:", techWords[0].count);
        }
        
    } catch (error) {
        console.error("Error checking vocabulary:", error);
    }
};

checkVocabulary();
