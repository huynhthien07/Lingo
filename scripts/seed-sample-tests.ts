import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.DATABASE_URL!);

async function seedSampleTests() {
  console.log("🌱 Starting sample tests seeding...");

  try {
    // 1. Get or create a teacher user
    console.log("👨‍🏫 Getting teacher user...");
    let teacher = await sql`
      SELECT user_id, email, user_name FROM users WHERE role = 'TEACHER' LIMIT 1
    `;

    if (teacher.length === 0) {
      console.log("Creating teacher user...");
      teacher = await sql`
        INSERT INTO users (user_id, email, user_name, role)
        VALUES ('teacher_test_001', 'teacher@ielts.com', 'Teacher John', 'TEACHER')
        RETURNING user_id, email, user_name
      `;
    }

    const teacherId = teacher[0].user_id;
    console.log(`✅ Teacher: ${teacher[0].user_name} (${teacher[0].email})`);

    // 2. Create Admission Test
    console.log("📝 Creating IELTS Admission Test...");
    const admissionTest = await sql`
      INSERT INTO tests (
        title, description, test_type, exam_type, duration, created_by
      )
      VALUES (
        'IELTS Placement Test',
        'Comprehensive placement test to assess your current IELTS level. This test covers all four skills: Listening, Reading, Writing, and Speaking.',
        'ADMISSION_TEST',
        'IELTS',
        120,
        ${teacherId}
      )
      RETURNING id
    `;

    console.log(`✅ Admission Test created (ID: ${admissionTest[0].id})`);

    // 3. Create Mock Test
    console.log("📝 Creating IELTS Mock Test...");
    const mockTest = await sql`
      INSERT INTO tests (
        title, description, test_type, exam_type, duration, created_by
      )
      VALUES (
        'IELTS Academic Mock Test 1',
        'Full-length IELTS Academic mock test simulating real exam conditions. Practice all sections with authentic question types.',
        'MOCK_TEST',
        'IELTS',
        180,
        ${teacherId}
      )
      RETURNING id
    `;

    console.log(`✅ Mock Test created (ID: ${mockTest[0].id})`);

    // 4. Create Practice Test
    console.log("📝 Creating IELTS Practice Test...");
    const practiceTest = await sql`
      INSERT INTO tests (
        title, description, test_type, exam_type, duration, created_by
      )
      VALUES (
        'IELTS Reading Practice - Academic',
        'Practice test focusing on IELTS Academic Reading section. Includes multiple passages with various question types.',
        'PRACTICE',
        'IELTS',
        60,
        ${teacherId}
      )
      RETURNING id
    `;

    console.log(`✅ Practice Test created (ID: ${practiceTest[0].id})`);

    // 5. Create TOEFL Full Test
    console.log("📝 Creating TOEFL Full Test...");
    const toeflTest = await sql`
      INSERT INTO tests (
        title, description, test_type, exam_type, duration, created_by
      )
      VALUES (
        'TOEFL iBT Complete Practice Test',
        'Complete TOEFL iBT practice test covering Reading, Listening, Speaking, and Writing sections.',
        'FULL_TEST',
        'TOEFL',
        240,
        ${teacherId}
      )
      RETURNING id
    `;

    console.log(`✅ TOEFL Test created (ID: ${toeflTest[0].id})`);

    // 6. Add sections to Admission Test
    console.log("📚 Adding sections to Admission Test...");

    // Listening Section
    const listeningSection = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${admissionTest[0].id},
        'Listening Section',
        'LISTENING',
        1,
        30
      )
      RETURNING id
    `;

    // Reading Section
    const readingSection = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${admissionTest[0].id},
        'Reading Section',
        'READING',
        2,
        60
      )
      RETURNING id
    `;

    // Writing Section
    const writingSection = await sql`
      INSERT INTO test_sections (test_id, title, skill_type, "order", duration)
      VALUES (
        ${admissionTest[0].id},
        'Writing Section',
        'WRITING',
        3,
        60
      )
      RETURNING id
    `;

    console.log(`✅ Added 3 sections to Admission Test`);

    // 7. Add sample questions to Listening Section
    console.log("❓ Adding sample questions to Listening Section...");

    const question1 = await sql`
      INSERT INTO test_questions (
        section_id, question_text, "order", points
      )
      VALUES (
        ${listeningSection[0].id},
        'What is the main topic of the conversation?',
        1,
        1
      )
      RETURNING id
    `;

    // Add options for question 1
    await sql`
      INSERT INTO test_question_options (question_id, option_text, is_correct, "order")
      VALUES
        (${question1[0].id}, 'A university course registration', true, 1),
        (${question1[0].id}, 'A job interview', false, 2),
        (${question1[0].id}, 'A library tour', false, 3),
        (${question1[0].id}, 'A campus orientation', false, 4)
    `;

    const question2 = await sql`
      INSERT INTO test_questions (
        section_id, question_text, "order", points
      )
      VALUES (
        ${listeningSection[0].id},
        'According to the speaker, what time does the library close on weekdays?',
        2,
        1
      )
      RETURNING id
    `;

    // Add options for question 2
    await sql`
      INSERT INTO test_question_options (question_id, option_text, is_correct, "order")
      VALUES
        (${question2[0].id}, '8:00 PM', false, 1),
        (${question2[0].id}, '9:00 PM', false, 2),
        (${question2[0].id}, '10:00 PM', true, 3),
        (${question2[0].id}, '11:00 PM', false, 4)
    `;

    console.log(`✅ Added 2 questions with options to Listening Section`);

    console.log("\n✨ Sample tests seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 1 IELTS Admission Test (with 3 sections and 2 questions)");
    console.log("  - 1 IELTS Mock Test");
    console.log("  - 1 IELTS Practice Test");
    console.log("  - 1 TOEFL Full Test");

  } catch (error) {
    console.error("❌ Error seeding sample tests:", error);
    throw error;
  }
}

seedSampleTests()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

