/**
 * Seed IELTS Intermediate Course with all 6 question types
 * Each exercise has 3-4 questions with passages/audio
 * Run with: npx tsx scripts/seed-ielts-questions.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges, questions, challengeOptions } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("🚀 Starting IELTS Intermediate course seeding...");

  try {
    // Find the course
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

    console.log(`✅ Found course: ${course.title}`);

    // Find or create Unit
    let unit = await db.query.units.findFirst({
      where: eq(units.courseId, course.id),
    });

    if (!unit) {
      const [newUnit] = await db.insert(units).values({
        title: "Unit 1: Question Types Practice",
        description: "Practice all 6 IELTS question types",
        courseId: course.id,
        order: 1,
      }).returning();
      unit = newUnit;
    }

    console.log(`✅ Unit: ${unit.title}\n`);

    // Define 6 lessons
    const lessonsData = [
      { title: "Lesson 1: Single Choice", skillType: "READING", challengeType: "READING_MULTIPLE_CHOICE", questionType: "SINGLE_CHOICE", order: 1 },
      { title: "Lesson 2: Multiple Choice", skillType: "READING", challengeType: "READING_MULTIPLE_CHOICE", questionType: "MULTIPLE_CHOICE", order: 2 },
      { title: "Lesson 3: Text Input", skillType: "READING", challengeType: "READING_SUMMARY_COMPLETION", questionType: "TEXT_INPUT", order: 3 },
      { title: "Lesson 4: Matching", skillType: "READING", challengeType: "READING_MATCHING_HEADINGS", questionType: "MATCHING", order: 4 },
      { title: "Lesson 5: Labeling", skillType: "LISTENING", challengeType: "LISTENING_MAP_LABELLING", questionType: "LABELING", order: 5 },
      { title: "Lesson 6: Ordering", skillType: "READING", challengeType: "READING_SENTENCE_COMPLETION", questionType: "ORDERING", order: 6 },
    ];

    for (const lessonData of lessonsData) {
      // Create or find lesson
      let lesson = await db.query.lessons.findFirst({
        where: and(eq(lessons.unitId, unit.id), eq(lessons.title, lessonData.title)),
      });

      if (!lesson) {
        const [newLesson] = await db.insert(lessons).values({
          title: lessonData.title,
          description: `Practice ${lessonData.questionType} questions`,
          unitId: unit.id,
          order: lessonData.order,
          skillType: lessonData.skillType as any,
          estimatedDuration: 15,
        }).returning();
        lesson = newLesson;
        console.log(`  ✅ Created: ${lesson.title}`);
      } else {
        console.log(`  ℹ️  Exists: ${lesson.title}`);
      }

      // Check if challenge exists
      const challengeQ = `Practice ${lessonData.questionType}`;
      let challenge = await db.query.challenges.findFirst({
        where: and(eq(challenges.lessonId, lesson.id), eq(challenges.question, challengeQ)),
      });

      if (challenge) {
        console.log(`    ℹ️  Challenge exists, skipping...\n`);
        continue;
      }

      // Create challenge with passage/audio
      let challengeValues: any = {
        lessonId: lesson.id,
        type: lessonData.challengeType as any,
        question: challengeQ,
        order: 1,
        difficulty: "MEDIUM",
        points: 10,
      };

      // Add passage for reading
      if (lessonData.skillType === "READING") {
        challengeValues.passage = getPassage(lessonData.questionType);
      }

      // Add audio for listening
      if (lessonData.skillType === "LISTENING") {
        challengeValues.audioSrc = "/audio/sample.mp3";
      }

      const [newChallenge] = await db.insert(challenges).values(challengeValues).returning();
      console.log(`    ✅ Created challenge`);

      // Create questions based on type
      if (lessonData.questionType === "SINGLE_CHOICE") {
        await createSingleChoice(newChallenge.id);
      } else if (lessonData.questionType === "MULTIPLE_CHOICE") {
        await createMultipleChoice(newChallenge.id);
      } else if (lessonData.questionType === "TEXT_INPUT") {
        await createTextInput(newChallenge.id);
      } else if (lessonData.questionType === "MATCHING") {
        await createMatching(newChallenge.id);
      } else if (lessonData.questionType === "LABELING") {
        await createLabeling(newChallenge.id);
      } else if (lessonData.questionType === "ORDERING") {
        await createOrdering(newChallenge.id);
      }
    }

    console.log("\n✅ Seeding completed!");
    console.log("📊 Summary: 6 lessons, 6 question types, 3-4 questions each");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Helper: Get reading passage
function getPassage(type: string): string {
  const passages: Record<string, string> = {
    SINGLE_CHOICE: `The Eiffel Tower is a wrought-iron lattice tower in Paris, France. Named after engineer Gustave Eiffel, it was constructed from 1887 to 1889 as the entrance to the 1889 World's Fair. Initially criticized, it has become a global icon of France and one of the most recognizable structures in the world. The tower is 324 metres tall and was the tallest man-made structure until 1930.`,

    MULTIPLE_CHOICE: `The European Union (EU) is a political and economic union of 27 member states located primarily in Europe. Member states include France, Germany, Italy, Spain, Poland, and others. The EU operates through institutions including the European Commission, Council of the European Union, and European Central Bank.`,

    TEXT_INPUT: `Paris, France's capital, is a major European city and global center for art, fashion, and culture. Its 19th-century cityscape is crisscrossed by wide boulevards and the River Seine. The city is known for landmarks like the Eiffel Tower and Notre-Dame cathedral. Paris is often called the "City of Light" (La Ville Lumière).`,

    MATCHING: `Capital cities serve as administrative and cultural centers. Paris is the capital of France, known for culture and fashion. Berlin is Germany's capital, known for history and nightlife. Rome is Italy's capital, home to ancient ruins. Madrid is Spain's capital, known for art museums.`,

    ORDERING: `Making tea requires following steps in order: First, boil fresh water. Then, warm your cup with hot water. Next, add the tea bag. Pour boiling water over it. Let it steep for 3-5 minutes. Finally, remove the tea bag and enjoy.`,
  };
  return passages[type] || "Sample passage.";
}

// Create SINGLE_CHOICE questions (3 questions)
async function createSingleChoice(challengeId: number) {
  const qs = [
    { text: "Who designed the Eiffel Tower?", options: [
      { text: "Gustave Eiffel", correct: true },
      { text: "Napoleon Bonaparte", correct: false },
      { text: "Louis XIV", correct: false },
      { text: "Charles de Gaulle", correct: false },
    ]},
    { text: "When was the Eiffel Tower built?", options: [
      { text: "1887-1889", correct: true },
      { text: "1900-1902", correct: false },
      { text: "1875-1877", correct: false },
      { text: "1920-1922", correct: false },
    ]},
    { text: "How tall is the Eiffel Tower?", options: [
      { text: "324 metres", correct: true },
      { text: "250 metres", correct: false },
      { text: "400 metres", correct: false },
      { text: "500 metres", correct: false },
    ]},
  ];

  for (let i = 0; i < qs.length; i++) {
    const [q] = await db.insert(questions).values({
      challengeId,
      text: qs[i].text,
      questionType: "SINGLE_CHOICE",
      order: i + 1,
    }).returning();

    for (let j = 0; j < qs[i].options.length; j++) {
      await db.insert(challengeOptions).values({
        questionId: q.id,
        text: qs[i].options[j].text,
        correct: qs[i].options[j].correct,
        order: j + 1,
      });
    }
  }
  console.log(`      ✅ Created 3 SINGLE_CHOICE questions\n`);
}

// Create MULTIPLE_CHOICE questions (3 questions)
async function createMultipleChoice(challengeId: number) {
  const qs = [
    { text: "Which are EU countries? (Select all)", options: [
      { text: "France", correct: true },
      { text: "Germany", correct: true },
      { text: "Brazil", correct: false },
      { text: "Japan", correct: false },
    ]},
    { text: "Which are EU institutions? (Select all)", options: [
      { text: "European Commission", correct: true },
      { text: "European Central Bank", correct: true },
      { text: "United Nations", correct: false },
      { text: "NATO", correct: false },
    ]},
    { text: "Which countries are in the EU? (Select all)", options: [
      { text: "Italy", correct: true },
      { text: "Spain", correct: true },
      { text: "Poland", correct: true },
      { text: "Russia", correct: false },
    ]},
  ];

  for (let i = 0; i < qs.length; i++) {
    const [q] = await db.insert(questions).values({
      challengeId,
      text: qs[i].text,
      questionType: "MULTIPLE_CHOICE",
      metadata: { maxSelections: 3 },
      order: i + 1,
    }).returning();

    for (let j = 0; j < qs[i].options.length; j++) {
      await db.insert(challengeOptions).values({
        questionId: q.id,
        text: qs[i].options[j].text,
        correct: qs[i].options[j].correct,
        order: j + 1,
      });
    }
  }
  console.log(`      ✅ Created 3 MULTIPLE_CHOICE questions\n`);
}

// Create TEXT_INPUT questions (4 questions)
async function createTextInput(challengeId: number) {
  const qs = [
    { text: "What is the capital of France?", answer: "Paris" },
    { text: "What river runs through Paris?", answer: "Seine" },
    { text: "What is Paris often called? (in French)", answer: "La Ville Lumière" },
    { text: "What famous cathedral is in Paris?", answer: "Notre-Dame" },
  ];

  for (let i = 0; i < qs.length; i++) {
    await db.insert(questions).values({
      challengeId,
      text: qs[i].text,
      questionType: "TEXT_INPUT",
      correctAnswer: qs[i].answer,
      metadata: { caseSensitive: false, acceptableAnswers: [qs[i].answer] },
      order: i + 1,
    });
  }
  console.log(`      ✅ Created 4 TEXT_INPUT questions\n`);
}

// Create MATCHING questions (1 question with 4 pairs)
async function createMatching(challengeId: number) {
  await db.insert(questions).values({
    challengeId,
    text: "Match the countries with their capitals",
    questionType: "MATCHING",
    metadata: {
      pairs: [
        { left: "France", right: "Paris", correctMatch: true },
        { left: "Germany", right: "Berlin", correctMatch: true },
        { left: "Italy", right: "Rome", correctMatch: true },
        { left: "Spain", right: "Madrid", correctMatch: true },
      ],
      leftItems: ["France", "Germany", "Italy", "Spain"],
      rightItems: ["Paris", "Berlin", "Rome", "Madrid"],
      correctPairs: {
        "France": "Paris",
        "Germany": "Berlin",
        "Italy": "Rome",
        "Spain": "Madrid",
      },
    },
    order: 1,
  });
  console.log(`      ✅ Created MATCHING question with 4 pairs\n`);
}

// Create LABELING questions (1 question with 3 labels)
async function createLabeling(challengeId: number) {
  await db.insert(questions).values({
    challengeId,
    text: "Label the parts of the diagram",
    questionType: "LABELING",
    imageSrc: "/images/diagram-sample.png",
    metadata: {
      labels: [
        { id: "1", text: "Heart", x: 50, y: 30, correctLabel: "Heart" },
        { id: "2", text: "Lungs", x: 50, y: 50, correctLabel: "Lungs" },
        { id: "3", text: "Liver", x: 50, y: 70, correctLabel: "Liver" },
      ],
      availableLabels: ["Heart", "Lungs", "Liver", "Stomach", "Brain"],
    },
    order: 1,
  });
  console.log(`      ✅ Created LABELING question with 3 labels\n`);
}

// Create ORDERING questions (1 question with 5 items)
async function createOrdering(challengeId: number) {
  await db.insert(questions).values({
    challengeId,
    text: "Put the steps in the correct order to make tea",
    questionType: "ORDERING",
    metadata: {
      items: [
        { id: "1", text: "Boil fresh water" },
        { id: "2", text: "Warm your cup" },
        { id: "3", text: "Add tea bag" },
        { id: "4", text: "Pour boiling water" },
        { id: "5", text: "Steep for 3-5 minutes" },
      ],
      correctOrder: ["1", "2", "3", "4", "5"],
    },
    order: 1,
  });
  console.log(`      ✅ Created ORDERING question with 5 items\n`);
}

// Run the script
main()
  .then(() => {
    console.log("\n🎉 All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Failed:", error);
    process.exit(1);
  });

