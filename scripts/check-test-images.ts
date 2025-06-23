import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const checkTestImages = async () => {
    try {
        console.log("📸 Current test image sources:\n");

        const tests = await sql`SELECT id, title, image_src FROM tests ORDER BY id`;
        
        tests.forEach((test: any) => {
            console.log(`  Test ${test.id}: ${test.title}`);
            console.log(`    Image: ${test.image_src}\n`);
        });

        // Show which image the grammar test uses
        const grammarTest = tests.find((test: any) => test.id === 1);
        if (grammarTest) {
            console.log(`🎯 Grammar test image source: ${grammarTest.image_src}`);
            console.log("This will be used for the reading test as well.");
        }

    } catch (error) {
        console.error("❌ Error checking test images:", error);
        throw error;
    }
};

if (require.main === module) {
    checkTestImages()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error("Failed to check test images:", error);
            process.exit(1);
        });
}
