import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables
config();

const sql = neon(process.env.DATABASE_URL!);

async function seedSampleLessons() {
  console.log("🌱 Seeding sample lessons and exercises...");

  try {
    // Get first unit from first course
    console.log("🔍 Finding units...");
    const units = await sql`SELECT id, title, course_id FROM units ORDER BY id LIMIT 2`;
    
    if (units.length === 0) {
      console.log("❌ No units found! Please run the main seed script first.");
      return;
    }

    const unit1 = units[0];
    const unit2 = units.length > 1 ? units[1] : units[0];
    
    console.log(`✅ Found units: ${unit1.title} (ID: ${unit1.id}), ${unit2.title} (ID: ${unit2.id})`);

    // Create sample lessons
    console.log("\n📚 Creating sample lessons...");
    
    // Lesson 1: Vocabulary - Multiple Choice (one question, multiple options)
    const lesson1 = await sql`
      INSERT INTO lessons (unit_id, title, description, "order", skill_type, estimated_duration)
      VALUES (
        ${unit1.id},
        'Basic Greetings - Vocabulary',
        'Learn common greeting words and phrases',
        1,
        'VOCABULARY',
        15
      )
      RETURNING id
    `;

    // Lesson 2: Reading - Fill in the Blank (one question, multiple blanks)
    const lesson2 = await sql`
      INSERT INTO lessons (unit_id, title, description, "order", skill_type, estimated_duration)
      VALUES (
        ${unit1.id},
        'Simple Sentences - Reading',
        'Practice reading and completing sentences',
        2,
        'READING',
        20
      )
      RETURNING id
    `;

    // Lesson 3: Listening - Multiple Choice with audio
    const lesson3 = await sql`
      INSERT INTO lessons (unit_id, title, description, "order", skill_type, estimated_duration)
      VALUES (
        ${unit2.id},
        'Listen and Choose - Listening',
        'Listen to audio and select the correct answer',
        1,
        'LISTENING',
        25
      )
      RETURNING id
    `;

    console.log(`✅ Created 3 lessons`);

    // Create exercises for each lesson
    console.log("\n🎯 Creating exercises...");

    // Exercise 1: Vocabulary - Multiple Choice
    const exercise1 = await sql`
      INSERT INTO challenges (lesson_id, type, question, "order")
      VALUES (
        ${lesson1[0].id},
        'READING_MULTIPLE_CHOICE',
        'What does "Hello" mean?',
        1
      )
      RETURNING id
    `;

    // Exercise 2: Reading - Sentence Completion (Fill in the Blank)
    const exercise2 = await sql`
      INSERT INTO challenges (lesson_id, type, question, "order")
      VALUES (
        ${lesson2[0].id},
        'READING_SENTENCE_COMPLETION',
        'Complete the sentence: I ___ a student. My name ___ John.',
        1
      )
      RETURNING id
    `;

    // Exercise 3: Listening - Multiple Choice with audio
    const exercise3 = await sql`
      INSERT INTO challenges (lesson_id, type, question, "order")
      VALUES (
        ${lesson3[0].id},
        'LISTENING_MULTIPLE_CHOICE',
        'Listen to the audio and choose the correct word',
        1
      )
      RETURNING id
    `;

    console.log(`✅ Created 3 exercises`);

    // Create questions for each exercise
    console.log("\n❓ Creating questions...");

    // Question 1 for Exercise 1 (Multiple Choice - one question)
    const question1 = await sql`
      INSERT INTO questions (challenge_id, text, "order")
      VALUES (
        ${exercise1[0].id},
        'Choose the correct meaning of "Hello"',
        1
      )
      RETURNING id
    `;

    // Question 2 for Exercise 2 (Fill in the Blank - one question with multiple blanks)
    const question2 = await sql`
      INSERT INTO questions (challenge_id, text, "order")
      VALUES (
        ${exercise2[0].id},
        'I ___ a student. My name ___ John.',
        1
      )
      RETURNING id
    `;

    // Question 3 for Exercise 3 (Listening - one question)
    const question3 = await sql`
      INSERT INTO questions (challenge_id, text, "order")
      VALUES (
        ${exercise3[0].id},
        'What word do you hear?',
        1
      )
      RETURNING id
    `;

    console.log(`✅ Created 3 questions`);

    // Create options for each question
    console.log("\n📝 Creating answer options...");

    // Options for Question 1 (Multiple Choice - 4 options, 1 correct)
    await sql`
      INSERT INTO challenge_options (challenge_id, question_id, text, correct, "order")
      VALUES
        (${exercise1[0].id}, ${question1[0].id}, 'A greeting word', true, 1),
        (${exercise1[0].id}, ${question1[0].id}, 'A goodbye word', false, 2),
        (${exercise1[0].id}, ${question1[0].id}, 'A thank you word', false, 3),
        (${exercise1[0].id}, ${question1[0].id}, 'A question word', false, 4)
    `;

    console.log("  ✅ Added 4 options for Question 1 (Multiple Choice)");

    // Options for Question 2 (Fill in the Blank - 2 correct answers for 2 blanks)
    await sql`
      INSERT INTO challenge_options (challenge_id, question_id, text, correct, "order")
      VALUES
        (${exercise2[0].id}, ${question2[0].id}, 'am', true, 1),
        (${exercise2[0].id}, ${question2[0].id}, 'is', true, 2)
    `;

    console.log("  ✅ Added 2 options for Question 2 (Fill in the Blank)");

    // Options for Question 3 (Listening - 3 options, 1 correct)
    await sql`
      INSERT INTO challenge_options (challenge_id, question_id, text, correct, "order", audio_src)
      VALUES
        (${exercise3[0].id}, ${question3[0].id}, 'Hello', true, 1, '/uploads/audio/hello.mp3'),
        (${exercise3[0].id}, ${question3[0].id}, 'Goodbye', false, 2, '/uploads/audio/goodbye.mp3'),
        (${exercise3[0].id}, ${question3[0].id}, 'Thank you', false, 3, '/uploads/audio/thankyou.mp3')
    `;

    console.log("  ✅ Added 3 options for Question 3 (Listening with audio)");

    console.log("\n✅ Sample lessons seeded successfully!");
    console.log("\n📊 Summary:");
    console.log("- Created 3 lessons:");
    console.log(`  1. Lesson ${lesson1[0].id}: Basic Greetings - Vocabulary (VOCABULARY)`);
    console.log(`  2. Lesson ${lesson2[0].id}: Simple Sentences - Reading (READING)`);
    console.log(`  3. Lesson ${lesson3[0].id}: Listen and Choose - Listening (LISTENING)`);
    console.log("\n- Created 3 exercises (1 per lesson)");
    console.log("- Created 3 questions (1 per exercise)");
    console.log("- Created answer options:");
    console.log("  • Question 1: 4 options (Multiple Choice)");
    console.log("  • Question 2: 2 options (Fill in the Blank - 2 blanks)");
    console.log("  • Question 3: 3 options (Listening with audio)");
    console.log("\n🎯 Exercise Types:");
    console.log("  • SELECT (Multiple Choice): Choose one correct answer from multiple options");
    console.log("  • FILL_BLANK: Fill in the blanks with correct words");
    console.log("  • SELECT with audio: Listen and choose the correct answer");
    console.log("\n📝 You can now:");
    console.log("  1. View lessons at http://localhost:3000/teacher/lessons");
    console.log("  2. Click on a lesson to see exercises");
    console.log("  3. Click on an exercise to see questions and options");
    console.log("  4. Edit questions and options as needed");

  } catch (error) {
    console.error("❌ Error seeding sample lessons:", error);
    throw error;
  }
}

seedSampleLessons()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed:", error);
    process.exit(1);
  });

