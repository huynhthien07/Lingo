/**
 * Seed Sample Courses with Units, Lessons, and Exercises
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { courses, units, lessons, challenges, challengeOptions } from "@/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seeding sample courses...");

  // Get a teacher user (or use admin)
  const teacherId = "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY"; // Replace with actual teacher ID

  // Create 3 sample courses
  const coursesData = [
    {
      title: "IELTS Foundation - Starter",
      imageSrc: "/mascot.svg",
      description: "Khóa học IELTS cơ bản dành cho người mới bắt đầu. Xây dựng nền tảng vững chắc về 4 kỹ năng: Listening, Reading, Writing, Speaking.",
      examType: "IELTS" as const,
      level: "BEGINNER" as const,
      price: 0,
      currency: "USD",
      isFree: true,
      createdBy: teacherId,
    },
    {
      title: "IELTS Intermediate - Band 5.0-6.0",
      imageSrc: "/mascot.svg",
      description: "Khóa học IELTS trung cấp giúp bạn đạt band 5.0-6.0. Luyện tập chuyên sâu các kỹ năng và chiến lược làm bài thi.",
      examType: "IELTS" as const,
      level: "INTERMEDIATE" as const,
      price: 29.99,
      currency: "USD",
      isFree: false,
      createdBy: teacherId,
    },
    {
      title: "IELTS Advanced - Band 6.5-8.0",
      imageSrc: "/mascot.svg",
      description: "Khóa học IELTS nâng cao giúp bạn đạt band 6.5-8.0. Chinh phục các dạng bài khó và nâng cao kỹ năng làm bài.",
      examType: "IELTS" as const,
      level: "ADVANCED" as const,
      price: 49.99,
      currency: "USD",
      isFree: false,
      createdBy: teacherId,
    },
  ];

  for (const courseData of coursesData) {
    console.log(`\n📚 Creating course: ${courseData.title}`);
    
    const [course] = await db.insert(courses).values(courseData).returning();
    console.log(`✅ Created course ID: ${course.id}`);

    // Create 3 units for each course
    const unitsData = [
      {
        title: "Unit 1: Introduction & Basic Skills",
        description: "Giới thiệu về IELTS và các kỹ năng cơ bản",
        courseId: course.id,
        order: 1,
      },
      {
        title: "Unit 2: Vocabulary & Grammar",
        description: "Từ vựng và ngữ pháp thiết yếu",
        courseId: course.id,
        order: 2,
      },
      {
        title: "Unit 3: Practice & Review",
        description: "Luyện tập và ôn tập tổng hợp",
        courseId: course.id,
        order: 3,
      },
    ];

    for (const unitData of unitsData) {
      console.log(`  📖 Creating unit: ${unitData.title}`);
      const [unit] = await db.insert(units).values(unitData).returning();
      console.log(`  ✅ Created unit ID: ${unit.id}`);

      // Create 3 lessons for each unit
      const lessonsData = [
        {
          title: "Lesson 1: Reading Comprehension",
          description: "Học cách đọc hiểu và trả lời câu hỏi",
          unitId: unit.id,
          order: 1,
          skillType: "READING" as const,
          estimatedDuration: 30,
        },
        {
          title: "Lesson 2: Listening Skills",
          description: "Rèn luyện kỹ năng nghe hiểu",
          unitId: unit.id,
          order: 2,
          skillType: "LISTENING" as const,
          estimatedDuration: 25,
        },
        {
          title: "Lesson 3: Writing & Speaking",
          description: "Thực hành viết và nói",
          unitId: unit.id,
          order: 3,
          skillType: "WRITING" as const,
          estimatedDuration: 40,
        },
      ];

      for (const lessonData of lessonsData) {
        console.log(`    📝 Creating lesson: ${lessonData.title}`);
        const [lesson] = await db.insert(lessons).values(lessonData).returning();
        console.log(`    ✅ Created lesson ID: ${lesson.id}`);

        // Create challenges for each lesson
        await createChallengesForLesson(lesson.id, lessonData.skillType);
      }
    }
  }

  console.log("\n✅ Sample courses seeded successfully!");
}

async function createChallengesForLesson(lessonId: number, skillType: string) {
  // Create different types of challenges based on skill type
  if (skillType === "READING") {
    await createReadingChallenge(lessonId);
  } else if (skillType === "LISTENING") {
    await createListeningChallenge(lessonId);
  } else if (skillType === "WRITING") {
    await createWritingChallenge(lessonId);
  }
}

async function createReadingChallenge(lessonId: number) {
  const passage = `Climate change is one of the most pressing issues facing humanity today. Scientists have observed that global temperatures have risen significantly over the past century, primarily due to human activities such as burning fossil fuels and deforestation. This warming trend has led to melting ice caps, rising sea levels, and more frequent extreme weather events.

The consequences of climate change are far-reaching and affect every aspect of our lives. Agricultural productivity is threatened by changing weather patterns, while coastal communities face the risk of flooding. Biodiversity is also at risk, with many species struggling to adapt to rapidly changing environments.

However, there is hope. Renewable energy technologies such as solar and wind power are becoming increasingly affordable and efficient. Many countries have committed to reducing their carbon emissions, and individuals can make a difference through lifestyle changes such as reducing energy consumption and supporting sustainable practices.`;

  // Challenge 1: Multiple Choice
  const [challenge1] = await db.insert(challenges).values({
    lessonId,
    type: "READING_MULTIPLE_CHOICE" as const,
    question: "What is identified as the primary cause of global temperature rise?",
    passage,
    order: 1,
    difficulty: "MEDIUM" as const,
    points: 10,
  }).returning();

  console.log(`      ✏️  Created reading challenge ID: ${challenge1.id}`);

  // Create options for challenge 1
  await db.insert(challengeOptions).values([
    {
      challengeId: challenge1.id,
      text: "Human activities such as burning fossil fuels",
      correct: true,
      audioSrc: null,
      imageSrc: null,
      order: 1,
    },
    {
      challengeId: challenge1.id,
      text: "Natural climate cycles",
      correct: false,
      audioSrc: null,
      imageSrc: null,
      order: 2,
    },
    {
      challengeId: challenge1.id,
      text: "Solar radiation changes",
      correct: false,
      audioSrc: null,
      imageSrc: null,
      order: 3,
    },
    {
      challengeId: challenge1.id,
      text: "Volcanic activity",
      correct: false,
      audioSrc: null,
      imageSrc: null,
      order: 4,
    },
  ]);

  // Challenge 2: True/False
  const [challenge2] = await db.insert(challenges).values({
    lessonId,
    type: "READING_TRUE_FALSE_NOT_GIVEN" as const,
    question: "Renewable energy technologies are becoming more expensive.",
    passage,
    order: 2,
    difficulty: "EASY" as const,
    points: 10,
  }).returning();

  await db.insert(challengeOptions).values([
    {
      challengeId: challenge2.id,
      text: "True",
      correct: false,
      audioSrc: null,
      imageSrc: null,
      order: 1,
    },
    {
      challengeId: challenge2.id,
      text: "False",
      correct: true,
      audioSrc: null,
      imageSrc: null,
      order: 2,
    },
  ]);
}

async function createListeningChallenge(lessonId: number) {
  const [challenge] = await db.insert(challenges).values({
    lessonId,
    type: "LISTENING_MULTIPLE_CHOICE" as const,
    question: "What is the main purpose of the tour?",
    passage: "Listening exercise about university campus tour. Students will hear a conversation between a tour guide and prospective students.",
    audioSrc: "/audio/sample-listening.mp3",
    order: 1,
    difficulty: "MEDIUM" as const,
    points: 10,
  }).returning();

  console.log(`      🎧 Created listening challenge ID: ${challenge.id}`);

  await db.insert(challengeOptions).values([
    {
      challengeId: challenge.id,
      text: "To show prospective students the campus facilities",
      correct: true,
      audioSrc: null,
      imageSrc: null,
      order: 1,
    },
    {
      challengeId: challenge.id,
      text: "To recruit new staff",
      correct: false,
      audioSrc: null,
      imageSrc: null,
      order: 2,
    },
    {
      challengeId: challenge.id,
      text: "To celebrate graduation",
      correct: false,
      audioSrc: null,
      imageSrc: null,
      order: 3,
    },
  ]);
}

async function createWritingChallenge(lessonId: number) {
  const [challenge] = await db.insert(challenges).values({
    lessonId,
    type: "WRITING_TASK_2" as const,
    question: "Some people believe that technology has made our lives more complicated. Others think it has made life easier. Discuss both views and give your own opinion. Write at least 250 words.",
    passage: null,
    audioSrc: null,
    order: 1,
    difficulty: "HARD" as const,
    points: 20,
  }).returning();

  console.log(`      ✍️  Created writing challenge ID: ${challenge.id}`);
}

main()
  .catch((error) => {
    console.error("❌ Error seeding sample courses:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("👋 Seeding complete!");
    process.exit(0);
  });

