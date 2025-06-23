import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const updateReadingTestImage = async () => {
    try {
        console.log("🔄 Updating reading test image to match grammar test...\n");

        // Get the grammar test image source
        const grammarTest = await sql`SELECT image_src FROM tests WHERE id = 1`;
        const grammarImageSrc = grammarTest[0].image_src;
        
        console.log(`📸 Grammar test image: ${grammarImageSrc}`);

        // Update the reading test (Test ID 3) to use the same image
        await sql`
            UPDATE tests 
            SET image_src = ${grammarImageSrc}
            WHERE id = 3
        `;

        console.log(`✅ Updated reading test image to: ${grammarImageSrc}`);

        // Verify the change
        const updatedTest = await sql`SELECT id, title, image_src FROM tests WHERE id = 3`;
        console.log(`\n📋 Verification:`);
        console.log(`  Test ${updatedTest[0].id}: ${updatedTest[0].title}`);
        console.log(`  Image: ${updatedTest[0].image_src}`);

        // Show all tests with their images for confirmation
        console.log(`\n📸 All test images after update:`);
        const allTests = await sql`SELECT id, title, image_src FROM tests ORDER BY id`;
        allTests.forEach((test: any) => {
            const sameAsGrammar = test.image_src === grammarImageSrc ? " ✓ (same as grammar)" : "";
            console.log(`  Test ${test.id}: ${test.title} -> ${test.image_src}${sameAsGrammar}`);
        });

        console.log(`\n✅ Successfully updated reading test image to match grammar test!`);

    } catch (error) {
        console.error("❌ Error updating reading test image:", error);
        throw error;
    }
};

export default updateReadingTestImage;

if (require.main === module) {
    updateReadingTestImage()
        .then(() => {
            console.log("✅ Image update completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to update image:", error);
            process.exit(1);
        });
}
