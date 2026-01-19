/**
 * Run All Admission Test Scripts in Sequence
 * This orchestrator runs all scripts to build the complete admission test
 * Run with: npx tsx scripts/run-all-admission-test-scripts.ts
 */

import { spawn } from "child_process";
import path from "path";

const scripts = [
  "recreate-admission-test.ts",                    // Part 1: Listening MCQ + Short Answer, Reading TFNG
  "recreate-admission-test-part2.ts",              // Part 2: Listening Ordering, Reading TFNG
  "recreate-admission-test-part3.ts",              // Part 3: Reading MCQ + Matching
  "recreate-admission-test-part4.ts",              // Part 4: Use of English (Grammar, Vocab, Error)
  "extend-admission-test-listening.ts",            // Extension: Add 30 listening questions
  "extend-admission-test-reading.ts",              // Extension: Add 30 reading questions
  "extend-admission-test-listening-final.ts",      // Extension: Add final 5 listening questions
];

async function runScript(scriptName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n${"=".repeat(70)}`);
    console.log(`▶️  Running: ${scriptName}`);
    console.log(`${"=".repeat(70)}\n`);

    const child = spawn("npx", ["tsx", `scripts/${scriptName}`], {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${scriptName} completed successfully\n`);
        resolve();
      } else {
        console.error(`\n❌ ${scriptName} failed with code ${code}\n`);
        reject(new Error(`Script ${scriptName} failed`));
      }
    });

    child.on("error", (error) => {
      console.error(`\n❌ Error running ${scriptName}:`, error);
      reject(error);
    });
  });
}

async function runAllScripts() {
  console.log("🚀 Starting Complete Admission Test Setup\n");
  console.log(`📋 Will run ${scripts.length} scripts in sequence:\n`);
  scripts.forEach((script, index) => {
    console.log(`  ${index + 1}. ${script}`);
  });

  try {
    for (const script of scripts) {
      await runScript(script);
    }

    console.log(`\n${"=".repeat(70)}`);
    console.log("🎉 All scripts completed successfully!");
    console.log(`${"=".repeat(70)}`);
    console.log("\n📊 Admission Test Summary:");
    console.log("  ✅ Listening: 40 questions (4 sections)");
    console.log("  ✅ Reading: 40 questions (5 sections)");
    console.log("  ✅ Use of English: 15 questions (3 sections)");
    console.log("  ✅ Total: 95 questions");
    console.log("\n💡 Next steps:");
    console.log("  1. Run: npx tsx scripts/check-admission-test.ts");
    console.log("  2. Verify the test structure");
    console.log("  3. Start the application and test the admission test\n");

  } catch (error) {
    console.error("\n❌ Setup failed:", error);
    process.exit(1);
  }
}

runAllScripts().catch((error) => {
  console.error(error);
  process.exit(1);
});

