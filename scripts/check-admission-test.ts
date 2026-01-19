/**
 * Check Admission Test structure
 * Run with: npx tsx scripts/check-admission-test.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { tests } from "../db/schema";
import { eq } from "drizzle-orm";

async function checkAdmissionTest() {
  console.log("🔍 Checking Admission Test structure...\n");

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

    console.log("📋 Test Information:");
    console.log(`  Title: ${admissionTest.title}`);
    console.log(`  Description: ${admissionTest.description}`);
    console.log(`  Duration: ${admissionTest.duration} minutes`);
    console.log(`  Test Type: ${admissionTest.testType}`);
    console.log(`  Exam Type: ${admissionTest.examType}`);
    console.log(`  Is Admission: ${admissionTest.isAdmission}`);
    console.log(`  Total Sections: ${admissionTest.sections.length}\n`);

    // Group sections by skill type
    const listeningSections = admissionTest.sections.filter(s => s.skillType === "LISTENING");
    const readingSections = admissionTest.sections.filter(s => s.skillType === "READING");

    console.log("📻 Listening Sections:");
    let totalListeningQuestions = 0;
    for (const section of listeningSections) {
      const questionCount = section.questions.length;
      totalListeningQuestions += questionCount;
      console.log(`  ${section.order}. ${section.title}`);
      console.log(`     Questions: ${questionCount}`);
      console.log(`     Audio: ${section.audioSrc || "Not set"}`);
    }
    console.log(`  Total Listening Questions: ${totalListeningQuestions}\n`);

    console.log("📚 Reading Sections:");
    let totalReadingQuestions = 0;
    for (const section of readingSections) {
      const questionCount = section.questions.length;
      totalReadingQuestions += questionCount;
      console.log(`  ${section.order}. ${section.title}`);
      console.log(`     Questions: ${questionCount}`);
      console.log(`     Passage Length: ${section.passage?.length || 0} characters`);
    }
    console.log(`  Total Reading Questions: ${totalReadingQuestions}\n`);

    console.log("📊 Summary:");
    console.log(`  Total Questions: ${totalListeningQuestions + totalReadingQuestions}`);
    console.log(`  Listening: ${totalListeningQuestions} questions (${listeningSections.length} sections)`);
    console.log(`  Reading: ${totalReadingQuestions} questions (${readingSections.length} sections)`);

    // Check if structure matches IELTS standard
    console.log("\n✅ IELTS Standard Check:");
    console.log(`  Listening sections: ${listeningSections.length === 4 ? "✅" : "❌"} (Expected: 4, Got: ${listeningSections.length})`);
    console.log(`  Listening questions: ${totalListeningQuestions === 40 ? "✅" : "❌"} (Expected: 40, Got: ${totalListeningQuestions})`);
    console.log(`  Reading sections: ${readingSections.length === 3 ? "✅" : "❌"} (Expected: 3, Got: ${readingSections.length})`);
    console.log(`  Reading questions: ${totalReadingQuestions === 40 ? "✅" : "❌"} (Expected: 40, Got: ${totalReadingQuestions})`);
    console.log(`  Total duration: ${admissionTest.duration === 60 ? "✅" : "❌"} (Expected: 60 min, Got: ${admissionTest.duration} min)`);

  } catch (error) {
    console.error("❌ Error checking admission test:", error);
    throw error;
  }
}

// Run the check function
checkAdmissionTest()
  .then(() => {
    console.log("\n🎉 Check completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Fatal error:", error);
    process.exit(1);
  });

