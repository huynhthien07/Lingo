/**
 * Master script to seed all IELTS content
 * Runs all 4 skill scripts in sequence
 * Run with: npx tsx scripts/seed-all-ielts.ts
 */

import { execSync } from "child_process";

async function main() {
  console.log("🚀 Starting IELTS Complete Course Seeding...\n");
  console.log("=" .repeat(60));

  const scripts = [
    { name: "Reading Skills", file: "seed-ielts-reading.ts", icon: "📖" },
    { name: "Listening Skills", file: "seed-ielts-listening.ts", icon: "🎧" },
    { name: "Writing Skills", file: "seed-ielts-writing.ts", icon: "✍️" },
    { name: "Speaking Skills", file: "seed-ielts-speaking.ts", icon: "🗣️" },
  ];

  for (const script of scripts) {
    console.log(`\n${script.icon} Running ${script.name}...`);
    console.log("-".repeat(60));
    
    try {
      execSync(`npx tsx scripts/${script.file}`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
      console.log(`✅ ${script.name} completed successfully!`);
    } catch (error) {
      console.error(`❌ ${script.name} failed!`);
      throw error;
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("\n🎉 All IELTS content seeded successfully!\n");
  console.log("📊 Final Summary:");
  console.log("  ✅ Unit 1: Reading Skills (6 lessons, 20+ questions)");
  console.log("  ✅ Unit 2: Listening Skills (4 lessons, 15+ questions)");
  console.log("  ✅ Unit 3: Writing Skills (4 lessons, 4 tasks)");
  console.log("  ✅ Unit 4: Speaking Skills (3 lessons, 6 challenges)");
  console.log("\n  📚 Total: 4 units, 17 lessons, 40+ exercises");
  console.log("\n✨ Your IELTS Intermediate course is ready to use!");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seeding failed:", error);
    process.exit(1);
  });

