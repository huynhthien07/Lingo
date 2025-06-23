import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const checkCourses = async () => {
    try {
        console.log("Checking current courses...");
        
        const courses = await sql`SELECT * FROM courses ORDER BY id`;
        console.log("Current courses:", courses);
        
        const sequence = await sql`SELECT last_value FROM courses_id_seq`;
        console.log("Current sequence value:", sequence);
        
    } catch (error) {
        console.error("Error checking courses:", error);
    }
};

checkCourses();
