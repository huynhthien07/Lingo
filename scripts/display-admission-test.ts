/**
 * Display Complete Admission Test Structure
 * Shows all sections and questions in a formatted way
 * Run with: npx tsx scripts/display-admission-test.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests } from "../db/schema";
import { eq } from "drizzle-orm";

async function displayAdmissionTest() {
  console.log("\n" + "=".repeat(80));
  console.log("📋 COMPLETE IELTS ADMISSION TEST STRUCTURE");
  console.log("=".repeat(80) + "\n");

  try {
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.order)],
          with: {
            questions: {
              orderBy: (questions, { asc }) => [asc(questions.order)],
            },
          },
        },
      },
    });

    if (!admissionTest) {
      console.log("❌ Admission test not found!");
      process.exit(1);
    }

    console.log(`📌 Test: ${admissionTest.title}`);
    console.log(`⏱️  Duration: ${admissionTest.duration} minutes`);
    console.log(`📊 Total Sections: ${admissionTest.sections.length}`);
    console.log(`❓ Total Questions: ${admissionTest.sections.reduce((sum, s) => sum + s.questions.length, 0)}\n`);

    let listeningCount = 0;
    let readingCount = 0;
    let grammarCount = 0;

    admissionTest.sections.forEach((section, index) => {
      const skillEmoji = {
        LISTENING: "🎧",
        READING: "📖",
        GRAMMAR: "✏️",
      }[section.skillType] || "❓";

      const skillColor = {
        LISTENING: "\x1b[36m", // Cyan
        READING: "\x1b[33m",   // Yellow
        GRAMMAR: "\x1b[35m",   // Magenta
      }[section.skillType] || "\x1b[0m";

      const reset = "\x1b[0m";

      console.log(`${skillEmoji} ${skillColor}Section ${section.order}: ${section.title}${reset}`);
      console.log(`   Type: ${section.skillType} | Questions: ${section.questions.length} | Duration: ${section.duration || "N/A"} min`);

      if (section.skillType === "LISTENING") listeningCount += section.questions.length;
      if (section.skillType === "READING") readingCount += section.questions.length;
      if (section.skillType === "GRAMMAR") grammarCount += section.questions.length;

      console.log("");
    });

    console.log("=".repeat(80));
    console.log("📊 SUMMARY BY SKILL TYPE");
    console.log("=".repeat(80));
    console.log(`🎧 Listening: ${listeningCount} questions`);
    console.log(`📖 Reading: ${readingCount} questions`);
    console.log(`✏️  Grammar/Use of English: ${grammarCount} questions`);
    console.log(`\n📈 Total: ${listeningCount + readingCount + grammarCount} questions`);
    console.log("=".repeat(80) + "\n");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

displayAdmissionTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

