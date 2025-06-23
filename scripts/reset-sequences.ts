import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);

const main = async () => {
    try {
        console.log("Resetting database sequences...");

        // Reset courses sequence
        await sql`SELECT setval('courses_id_seq', (SELECT MAX(id) FROM courses));`;
        console.log("✅ Reset courses sequence");

        // Reset units sequence
        await sql`SELECT setval('units_id_seq', (SELECT MAX(id) FROM units));`;
        console.log("✅ Reset units sequence");

        // Reset lessons sequence
        await sql`SELECT setval('lessons_id_seq', (SELECT MAX(id) FROM lessons));`;
        console.log("✅ Reset lessons sequence");

        // Reset challenges sequence
        await sql`SELECT setval('challenges_id_seq', (SELECT MAX(id) FROM challenges));`;
        console.log("✅ Reset challenges sequence");

        // Reset challengeOptions sequence
        await sql`SELECT setval('challengeoptions_id_seq', (SELECT MAX(id) FROM challengeoptions));`;
        console.log("✅ Reset challengeOptions sequence");

        // Reset userProgress sequence (if it has one)
        try {
            await sql`SELECT setval('userprogress_id_seq', (SELECT MAX(id) FROM userprogress));`;
            console.log("✅ Reset userProgress sequence");
        } catch (e) {
            console.log("ℹ️  userProgress doesn't have an auto-increment sequence");
        }

        console.log("🎉 All sequences reset successfully!");
        
    } catch (error) {
        console.error("❌ Error resetting sequences:", error);
    }
};

main();
