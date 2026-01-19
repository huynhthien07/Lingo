/**
 * Seed IELTS Writing Skills
 * Creates writing lessons (Task 1 and Task 2)
 * Run with: npx tsx scripts/seed-ielts-writing.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("✍️  Starting IELTS Writing Skills seeding...\n");

  try {
    // Find course
    const course = await db.query.courses.findFirst({
      where: and(
        eq(courses.title, "IELTS Intermediate - Band 5.0-6.0"),
        eq(courses.examType, "IELTS")
      ),
    });

    if (!course) {
      console.error("❌ Course not found!");
      return;
    }

    console.log(`✅ Course: ${course.title}`);

    // Create or find Unit for Writing
    let unit = await db.query.units.findFirst({
      where: and(
        eq(units.courseId, course.id),
        eq(units.title, "Unit 3: Writing Skills")
      ),
    });

    if (!unit) {
      const [newUnit] = await db.insert(units).values({
        title: "Unit 3: Writing Skills",
        description: "Master IELTS Writing Task 1 and Task 2",
        courseId: course.id,
        order: 3,
      }).returning();
      unit = newUnit;
      console.log(`✅ Created unit: ${unit.title}\n`);
    } else {
      console.log(`✅ Found unit: ${unit.title}\n`);
    }

    // Lesson 1: Task 1 - Describing Graphs
    await createLesson1(unit.id);

    // Lesson 2: Task 1 - Describing Processes
    await createLesson2(unit.id);

    // Lesson 3: Task 2 - Opinion Essays
    await createLesson3(unit.id);

    // Lesson 4: Task 2 - Discussion Essays
    await createLesson4(unit.id);

    console.log("\n✅ Writing Skills seeding completed!");
    console.log("📊 Summary: 4 lessons (2 Task 1, 2 Task 2)");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Lesson 1: Task 1 - Describing Graphs
async function createLesson1(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Writing Task 1 - Graphs & Charts")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 1 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Writing Task 1 - Graphs & Charts",
    description: "Learn to describe visual data (graphs, charts, tables)",
    unitId,
    order: 1,
    skillType: "WRITING",
    estimatedDuration: 30,
  }).returning();

  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "WRITING_TASK_1",
    question: "Describe the graph showing smartphone sales from 2018 to 2023",
    imageSrc: "/images/smartphone-sales-graph.png",
    passage: `The graph shows smartphone sales (in millions) for three major brands from 2018 to 2023.

Task: Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.

Tips:
- Start with an overview of the main trends
- Describe specific data points and changes
- Make comparisons between brands
- Use appropriate vocabulary for describing trends (increase, decrease, fluctuate, etc.)
- Organize your response with clear paragraphs`,
    order: 1,
    difficulty: "MEDIUM",
    points: 20,
  });

  console.log(`  ✅ Lesson 1: Writing Task 1 - Graphs & Charts`);
}

// Lesson 2: Task 1 - Describing Processes
async function createLesson2(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Writing Task 1 - Processes & Diagrams")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 2 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Writing Task 1 - Processes & Diagrams",
    description: "Learn to describe processes and diagrams",
    unitId,
    order: 2,
    skillType: "WRITING",
    estimatedDuration: 30,
  }).returning();

  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "WRITING_TASK_1",
    question: "Describe the process of how coffee is produced",
    imageSrc: "/images/coffee-production-process.png",
    passage: `The diagram shows the process of coffee production from growing to packaging.

Task: Summarize the information by selecting and reporting the main features.

Write at least 150 words.

Tips:
- Use sequencing words (first, then, next, after that, finally)
- Use passive voice where appropriate
- Describe each stage clearly
- Maintain a logical flow
- Don't add your own opinions`,
    order: 1,
    difficulty: "MEDIUM",
    points: 20,
  });

  console.log(`  ✅ Lesson 2: Writing Task 1 - Processes & Diagrams`);
}

// Lesson 3: Task 2 - Opinion Essays
async function createLesson3(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Writing Task 2 - Opinion Essays")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 3 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Writing Task 2 - Opinion Essays",
    description: "Learn to write opinion essays",
    unitId,
    order: 3,
    skillType: "WRITING",
    estimatedDuration: 40,
  }).returning();

  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "WRITING_TASK_2",
    question: "To what extent do you agree or disagree?",
    passage: `Some people believe that social media has a negative impact on society, while others think it brings more benefits than drawbacks.

To what extent do you agree or disagree with this statement?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.

Essay Structure:
1. Introduction
   - Paraphrase the question
   - State your opinion clearly

2. Body Paragraph 1
   - First main point supporting your opinion
   - Explanation and examples

3. Body Paragraph 2
   - Second main point supporting your opinion
   - Explanation and examples

4. Conclusion
   - Summarize main points
   - Restate your opinion

Tips:
- Take a clear position (agree, disagree, or partially agree)
- Support your opinion with reasons and examples
- Use formal academic language
- Organize ideas logically with clear paragraphs
- Use linking words (however, moreover, furthermore, etc.)`,
    order: 1,
    difficulty: "HARD",
    points: 25,
  });

  console.log(`  ✅ Lesson 3: Writing Task 2 - Opinion Essays`);
}

// Lesson 4: Task 2 - Discussion Essays
async function createLesson4(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Writing Task 2 - Discussion Essays")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 4 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Writing Task 2 - Discussion Essays",
    description: "Learn to write discussion essays",
    unitId,
    order: 4,
    skillType: "WRITING",
    estimatedDuration: 40,
  }).returning();

  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "WRITING_TASK_2",
    question: "Discuss both views and give your opinion",
    passage: `Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.

Discuss both these views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.

Essay Structure:
1. Introduction
   - Paraphrase the question
   - Mention both views
   - State your opinion (optional)

2. Body Paragraph 1
   - Discuss the first view
   - Provide reasons and examples

3. Body Paragraph 2
   - Discuss the second view
   - Provide reasons and examples

4. Body Paragraph 3 (Optional)
   - Give your own opinion
   - Explain why you hold this view

5. Conclusion
   - Summarize both views
   - Restate your opinion

Tips:
- Present both sides fairly and objectively
- Use phrases like "On the one hand... On the other hand..."
- Provide balanced arguments
- Make your own opinion clear
- Use a variety of sentence structures
- Check grammar and spelling`,
    order: 1,
    difficulty: "HARD",
    points: 25,
  });

  console.log(`  ✅ Lesson 4: Writing Task 2 - Discussion Essays`);
}

// Run the script
main()
  .then(() => {
    console.log("\n🎉 Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });

