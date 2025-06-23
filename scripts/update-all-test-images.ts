import { neon } from "@neondatabase/serverless";
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL!);

const updateAllTestImages = async () => {
    try {
        console.log("🔄 Updating all test images to match grammar test...\n");

        // Get the grammar test image source
        const grammarTest = await sql`SELECT image_src FROM tests WHERE id = 1`;
        const grammarImageSrc = grammarTest[0].image_src;
        
        console.log(`📸 Grammar test image: ${grammarImageSrc}`);
        console.log("This will be applied to all tests.\n");

        // Show current state before update
        console.log("📋 Before update:");
        const testsBefore = await sql`SELECT id, title, image_src FROM tests ORDER BY id`;
        testsBefore.forEach((test: any) => {
            console.log(`  Test ${test.id}: ${test.title} -> ${test.image_src}`);
        });

        // Update all tests to use the grammar test image
        await sql`
            UPDATE tests 
            SET image_src = ${grammarImageSrc}
            WHERE id != 1
        `;

        console.log(`\n✅ Updated all tests to use: ${grammarImageSrc}`);

        // Show updated state
        console.log("\n📋 After update:");
        const testsAfter = await sql`SELECT id, title, image_src FROM tests ORDER BY id`;
        testsAfter.forEach((test: any) => {
            const isUpdated = test.image_src === grammarImageSrc ? " ✓" : "";
            console.log(`  Test ${test.id}: ${test.title} -> ${test.image_src}${isUpdated}`);
        });

        // Count how many tests were updated
        const updatedCount = testsAfter.filter((test: any) => test.image_src === grammarImageSrc).length;
        console.log(`\n📊 Summary:`);
        console.log(`  • Total tests: ${testsAfter.length}`);
        console.log(`  • Tests using grammar image: ${updatedCount}`);
        console.log(`  • All tests now have consistent images: ${updatedCount === testsAfter.length ? 'YES ✅' : 'NO ❌'}`);

        console.log(`\n✅ Successfully updated all test images to match grammar test!`);

    } catch (error) {
        console.error("❌ Error updating test images:", error);
        throw error;
    }
};

export default updateAllTestImages;

if (require.main === module) {
    updateAllTestImages()
        .then(() => {
            console.log("✅ All test images update completed successfully!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ Failed to update test images:", error);
            process.exit(1);
        });
}
