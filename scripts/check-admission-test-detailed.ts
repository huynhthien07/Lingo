/**
 * Check Admission Test structure in detail
 * Run with: npx tsx scripts/check-admission-test-detailed.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests } from "../db/schema";
import { eq } from "drizzle-orm";

async function checkAdmissionTestDetailed() {
  console.log("🔍 Checking Admission Test structure in detail...\n");

  try {
    // Find admission test
    const admissionTest = await db.query.tests.findFirst({
      where: eq(tests.isAdmission, true),
      with: {
        sections: {
          orderBy: (sections, { asc }) => [asc(sections.order)],
          with: {
            questions: {
              orderBy: (questions, { asc }) => [asc(questions.order)],
              with: {
                options: {
                  orderBy: (options, { asc }) => [asc(options.order)],
                },
              },
            },
          },
        },
      },
    });

    if (!admissionTest) {
      console.log("❌ No admission test found.");
      return;
    }

    console.log("=" .repeat(80));
    console.log(`📋 TEST: ${admissionTest.title}`);
    console.log("=" .repeat(80));
    console.log(`ID: ${admissionTest.id}`);
    console.log(`Duration: ${admissionTest.duration} minutes`);
    console.log(`Total Sections: ${admissionTest.sections.length}`);
    console.log("");

    let totalQuestions = 0;

    admissionTest.sections.forEach((section, idx) => {
      console.log("─".repeat(80));
      console.log(`SECTION ${idx + 1}: ${section.title}`);
      console.log("─".repeat(80));
      console.log(`Skill Type: ${section.skillType}`);
      console.log(`Duration: ${section.duration} minutes`);
      console.log(`Total Questions: ${section.questions.length}`);
      console.log("");

      // Group questions by type
      const questionsByType: Record<string, number> = {};
      section.questions.forEach((q) => {
        const type = q.questionType || "UNKNOWN";
        questionsByType[type] = (questionsByType[type] || 0) + 1;
      });

      console.log("Question Types:");
      Object.entries(questionsByType).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count} questions`);
      });
      console.log("");

      // Show first 3 questions as examples
      console.log("Sample Questions:");
      section.questions.slice(0, 3).forEach((q, qIdx) => {
        console.log(`  Q${qIdx + 1}. [${q.questionType}] ${q.questionText.replace(/<[^>]*>/g, '').substring(0, 80)}...`);
        if (q.options.length > 0) {
          console.log(`      Options: ${q.options.length}`);
        }
        if (q.metadata) {
          console.log(`      Has metadata: Yes`);
        }
      });
      console.log("");

      totalQuestions += section.questions.length;
    });

    console.log("=" .repeat(80));
    console.log("📊 SUMMARY");
    console.log("=" .repeat(80));
    console.log(`Total Questions: ${totalQuestions}`);
    console.log(`Total Duration: ${admissionTest.duration} minutes`);
    console.log("");

    admissionTest.sections.forEach((section, idx) => {
      console.log(`  ${idx + 1}. ${section.title}: ${section.questions.length} questions (${section.duration} min)`);
    });

    console.log("");
    console.log("✅ Check completed!");

  } catch (error) {
    console.error("❌ Error checking admission test:", error);
    throw error;
  } finally {
    process.exit(0);
  }
}

checkAdmissionTestDetailed();

