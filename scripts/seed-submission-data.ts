import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config();

const sql = neon(process.env.DATABASE_URL!);

async function seedSubmissionData() {
  console.log("🌱 Starting submission data seeding...");

  try {
    // 1. Get or create a student user
    console.log("📝 Getting student user...");
    let student = await sql`
      SELECT user_id, email, user_name FROM users WHERE role = 'STUDENT' LIMIT 1
    `;

    if (student.length === 0) {
      console.log("Creating student user...");
      student = await sql`
        INSERT INTO users (user_id, email, user_name, role)
        VALUES ('student_test_001', 'student@test.com', 'Test Student', 'STUDENT')
        RETURNING user_id, email, user_name
      `;
    }

    const studentId = student[0].user_id;
    console.log(`✅ Student: ${student[0].user_name} (${student[0].email})`);

    // 2. Get first unit to create writing/speaking challenges
    console.log("📚 Getting first unit...");
    const units = await sql`SELECT id FROM units LIMIT 1`;
    
    if (units.length === 0) {
      console.log("❌ No units found. Please run seed-sample-lessons.ts first.");
      return;
    }

    const unitId = units[0].id;

    // 3. Create Writing Lesson with WRITING_TASK_2 challenge
    console.log("✍️ Creating Writing lesson and challenge...");
    
    const writingLesson = await sql`
      INSERT INTO lessons (unit_id, title, description, "order", skill_type, estimated_duration)
      VALUES (${unitId}, 'Essay Writing Practice', 'Practice writing IELTS Task 2 essays', 10, 'WRITING', 40)
      RETURNING id
    `;

    const writingChallenge = await sql`
      INSERT INTO challenges (lesson_id, type, question, "order", difficulty, points)
      VALUES (
        ${writingLesson[0].id},
        'WRITING_TASK_2',
        'Some people believe that technology has made our lives more complicated. Others think it has made life easier. Discuss both views and give your own opinion. Write at least 250 words.',
        1,
        'MEDIUM',
        50
      )
      RETURNING id
    `;

    console.log(`✅ Writing challenge created (ID: ${writingChallenge[0].id})`);

    // 4. Create Speaking Lesson with SPEAKING_PART_2 challenge
    console.log("🎤 Creating Speaking lesson and challenge...");
    
    const speakingLesson = await sql`
      INSERT INTO lessons (unit_id, title, description, "order", skill_type, estimated_duration)
      VALUES (${unitId}, 'Speaking Part 2 Practice', 'Practice IELTS Speaking Part 2 - Individual long turn', 11, 'SPEAKING', 15)
      RETURNING id
    `;

    const speakingChallenge = await sql`
      INSERT INTO challenges (lesson_id, type, question, "order", difficulty, points)
      VALUES (
        ${speakingLesson[0].id},
        'SPEAKING_PART_2',
        'Describe a book you have recently read. You should say: what the book was about, why you decided to read it, what you learned from it, and explain whether you would recommend this book to others.',
        1,
        'MEDIUM',
        50
      )
      RETURNING id
    `;

    console.log(`✅ Speaking challenge created (ID: ${speakingChallenge[0].id})`);

    // 5. Create Writing Submissions (3 submissions with different statuses)
    console.log("📄 Creating writing submissions...");

    // Submission 1: PENDING
    await sql`
      INSERT INTO writing_submissions (
        user_id, challenge_id, content, word_count, status, submitted_at
      )
      VALUES (
        ${studentId},
        ${writingChallenge[0].id},
        'Technology has become an integral part of modern life, and its impact on our daily routines is undeniable. While some argue that technological advancements have complicated our lives, others believe they have made things easier. In my opinion, although technology can sometimes be overwhelming, its benefits far outweigh the drawbacks.

On one hand, technology has indeed introduced complexity into our lives. The constant need to update software, learn new applications, and manage multiple devices can be frustrating. For instance, many elderly people struggle to adapt to smartphones and computers, finding traditional methods more straightforward. Moreover, the abundance of information available online can be overwhelming, making it difficult to distinguish between reliable and unreliable sources.

On the other hand, technology has significantly simplified many aspects of our lives. Communication has become instantaneous through email, messaging apps, and video calls, allowing people to stay connected regardless of distance. Tasks that once took hours, such as banking or shopping, can now be completed in minutes from the comfort of our homes. Additionally, technology has revolutionized healthcare, education, and transportation, making these services more accessible and efficient.

In conclusion, while technology may present certain challenges, its overall contribution to making our lives easier cannot be denied. The key is to embrace technological advancements while being mindful of their potential drawbacks.',
        267,
        'PENDING',
        NOW() - INTERVAL '2 days'
      )
    `;

    // Submission 2: GRADED
    await sql`
      INSERT INTO writing_submissions (
        user_id, challenge_id, content, word_count, status,
        task_achievement_score, coherence_cohesion_score,
        lexical_resource_score, grammatical_range_score,
        overall_band_score, teacher_feedback, submitted_at, graded_at
      )
      VALUES (
        ${studentId},
        ${writingChallenge[0].id},
        'In today modern world, technology play important role in our life. Some people think technology make life complicated but other people think it make life easy. I will discuss both view.

First, technology is complicated because many people not understand how to use. For example, my grandmother cannot use smartphone. She say it too difficult. Also, technology always change and we must learn new thing every time.

Second, technology make life easy because we can do many thing fast. We can talk to friend in other country. We can buy thing online. We can find information quick on internet.

In conclusion, I think technology is good and bad. It depend on person. Young people like technology but old people not like. We should help old people learn technology.',
        142,
        'GRADED',
        5.0,
        4.5,
        5.5,
        4.0,
        4.75,
        'Your essay addresses the task but needs significant improvement. Task Achievement: You covered both views but your opinion is not clearly developed. Coherence: The essay structure is basic; use more linking words. Lexical Resource: Limited vocabulary range; avoid repetition. Grammar: Many grammatical errors affect clarity (subject-verb agreement, article usage). Aim for at least 250 words and work on sentence variety.',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '3 days'
      )
    `;

    // Submission 3: PENDING (different student if available)
    await sql`
      INSERT INTO writing_submissions (
        user_id, challenge_id, content, word_count, status, submitted_at
      )
      VALUES (
        ${studentId},
        ${writingChallenge[0].id},
        'The debate over whether technology has simplified or complicated our lives is ongoing. Both perspectives have merit, and I will explore them before presenting my view.

Proponents of the idea that technology complicates life point to several issues. The learning curve associated with new technologies can be steep, particularly for older generations. Furthermore, the constant connectivity enabled by smartphones and computers has blurred the boundaries between work and personal life, leading to increased stress and burnout.

However, the argument that technology has made life easier is equally compelling. Modern technology has automated numerous tasks, freeing up time for more meaningful activities. Online platforms have democratized access to education and information, enabling people worldwide to learn new skills and stay informed. Medical technology has improved diagnosis and treatment, saving countless lives.

In my view, while technology does present challenges, its positive impact is more significant. The complications often arise from our inability to adapt or set boundaries, rather than from technology itself. With proper education and mindful usage, we can harness technology benefits while minimizing its drawbacks.

To conclude, technology has undoubtedly transformed our lives in complex ways. However, I believe that its capacity to simplify tasks and improve quality of life makes it an invaluable asset to modern society.',
        251,
        'PENDING',
        NOW() - INTERVAL '1 day'
      )
    `;

    console.log("✅ Created 3 writing submissions");

    // 6. Create Speaking Submissions (2 submissions)
    console.log("🎙️ Creating speaking submissions...");

    // Speaking Submission 1: PENDING
    await sql`
      INSERT INTO speaking_submissions (
        user_id, challenge_id, audio_url, duration, status, submitted_at
      )
      VALUES (
        ${studentId},
        ${speakingChallenge[0].id},
        '/uploads/audio/sample-speaking-1.mp3',
        125,
        'PENDING',
        NOW() - INTERVAL '1 day'
      )
    `;

    // Speaking Submission 2: GRADED
    await sql`
      INSERT INTO speaking_submissions (
        user_id, challenge_id, audio_url, duration, status,
        fluency_coherence_score, lexical_resource_score,
        grammatical_range_score, pronunciation_score,
        overall_band_score, teacher_feedback, submitted_at, graded_at
      )
      VALUES (
        ${studentId},
        ${speakingChallenge[0].id},
        '/uploads/audio/sample-speaking-2.mp3',
        98,
        'GRADED',
        6.0,
        6.5,
        6.0,
        7.0,
        6.375,
        'Good attempt overall. Fluency: You maintained a steady pace with few hesitations. Vocabulary: Good range of topic-specific words. Grammar: Generally accurate but try using more complex structures. Pronunciation: Clear and easy to understand. To improve, work on extending your answers with more detailed examples and use a wider variety of grammatical structures.',
        NOW() - INTERVAL '4 days',
        NOW() - INTERVAL '2 days'
      )
    `;

    console.log("✅ Created 2 speaking submissions");

    console.log("\n✨ Submission data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log("  - 1 Writing lesson with WRITING_TASK_2 challenge");
    console.log("  - 1 Speaking lesson with SPEAKING_PART_2 challenge");
    console.log("  - 3 Writing submissions (2 PENDING, 1 GRADED)");
    console.log("  - 2 Speaking submissions (1 PENDING, 1 GRADED)");

  } catch (error) {
    console.error("❌ Error seeding submission data:", error);
    throw error;
  }
}

seedSubmissionData()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });

