import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.DATABASE_URL!);

async function seedSpeakingWritingTests() {
  console.log("🌱 Starting Speaking & Writing tests seeding...");

  try {
    // Get teacher user
    console.log("👨‍🏫 Getting teacher user...");
    const teacher = await sql`
      SELECT user_id FROM users WHERE role = 'TEACHER' LIMIT 1
    `;

    if (teacher.length === 0) {
      console.error("❌ No teacher found. Please run seed-sample-tests.ts first.");
      process.exit(1);
    }

    const teacherId = teacher[0].user_id;

    // 1. Create Speaking Test
    console.log("🎤 Creating IELTS Speaking Test...");
    const speakingTest = await sql`
      INSERT INTO tests (
        title, description, test_type, exam_type, duration, created_by
      )
      VALUES (
        'IELTS Speaking Test - Part 1, 2, 3',
        'Complete IELTS Speaking test covering all three parts. Your responses will be recorded and sent to a teacher for evaluation.',
        'SPEAKING_TEST',
        'IELTS',
        15,
        ${teacherId}
      )
      RETURNING id
    `;

    // Add Speaking sections
    const speakingPart1 = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${speakingTest[0].id},
        'Part 1: Introduction and Interview',
        'SPEAKING',
        1,
        5
      )
      RETURNING id
    `;

    const speakingPart2 = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${speakingTest[0].id},
        'Part 2: Individual Long Turn',
        'SPEAKING',
        2,
        4
      )
      RETURNING id
    `;

    const speakingPart3 = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${speakingTest[0].id},
        'Part 3: Two-way Discussion',
        'SPEAKING',
        3,
        6
      )
      RETURNING id
    `;

    console.log(`✅ Speaking Test created with 3 sections`);

    // 2. Create Writing Test
    console.log("✍️ Creating IELTS Writing Test...");
    const writingTest = await sql`
      INSERT INTO tests (
        title, description, test_type, exam_type, duration, created_by
      )
      VALUES (
        'IELTS Writing Test - Task 1 & 2',
        'Complete IELTS Academic Writing test. Task 1: Describe visual information. Task 2: Write an essay. Your writing will be sent to a teacher for grading.',
        'WRITING_TEST',
        'IELTS',
        60,
        ${teacherId}
      )
      RETURNING id
    `;

    // Add Writing sections
    const writingTask1 = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${writingTest[0].id},
        'Task 1: Describe Visual Information',
        'WRITING',
        1,
        20
      )
      RETURNING id
    `;

    const writingTask2 = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${writingTest[0].id},
        'Task 2: Essay Writing',
        'WRITING',
        2,
        40
      )
      RETURNING id
    `;

    console.log(`✅ Writing Test created with 2 sections`);

    console.log("\n✨ Speaking & Writing tests seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 1 IELTS Speaking Test (3 parts)");
    console.log("  - 1 IELTS Writing Test (2 tasks)");
    console.log("\n💡 Note: These tests require teacher grading and are separate from Full Tests.");

  } catch (error) {
    console.error("❌ Error seeding Speaking & Writing tests:", error);
    throw error;
  }
}

seedSpeakingWritingTests()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

