/**
 * Seed IELTS Reading Skills
 * Creates reading lessons with various question types
 * Run with: npx tsx scripts/seed-ielts-reading.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges, questions, challengeOptions } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("📖 Starting IELTS Reading Skills seeding...\n");

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

    // Create or find Unit for Reading
    let unit = await db.query.units.findFirst({
      where: and(
        eq(units.courseId, course.id),
        eq(units.title, "Unit 1: Reading Skills")
      ),
    });

    if (!unit) {
      const [newUnit] = await db.insert(units).values({
        title: "Unit 1: Reading Skills",
        description: "Master IELTS Reading question types",
        courseId: course.id,
        order: 1,
      }).returning();
      unit = newUnit;
      console.log(`✅ Created unit: ${unit.title}\n`);
    } else {
      console.log(`✅ Found unit: ${unit.title}\n`);
    }

    // Lesson 1: Multiple Choice (Single Answer)
    await createLesson1(unit.id);

    // Lesson 2: Multiple Choice (Multiple Answers)
    await createLesson2(unit.id);

    // Lesson 3: True/False/Not Given
    await createLesson3(unit.id);

    // Lesson 4: Matching Headings
    await createLesson4(unit.id);

    // Lesson 5: Sentence Completion
    await createLesson5(unit.id);

    // Lesson 6: Summary Completion
    await createLesson6(unit.id);

    console.log("\n✅ Reading Skills seeding completed!");
    console.log("📊 Summary: 6 lessons, 20+ questions");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Lesson 1: Multiple Choice (Single Answer)
async function createLesson1(unitId: number) {
  // Check if exists
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Multiple Choice - Single Answer")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 1 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Multiple Choice - Single Answer",
    description: "Choose ONE correct answer from options",
    unitId,
    order: 1,
    skillType: "READING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "READING_MULTIPLE_CHOICE",
    question: "The History of the Internet",
    passage: `The History of the Internet

The Internet began in the 1960s as a project funded by the U.S. Department of Defense. Called ARPANET, it was designed to allow computers at different universities and research institutions to communicate with each other.

In 1989, British scientist Tim Berners-Lee invented the World Wide Web while working at CERN in Switzerland. He created the first web browser and web server, making it possible for people to access information through web pages.

The 1990s saw explosive growth of the Internet. Companies like Amazon (1994) and Google (1998) were founded. By 2000, over 400 million people worldwide were using the Internet.

Today, over 5 billion people use the Internet, representing more than 60% of the global population. Social media, streaming services, and cloud computing have transformed how we communicate, work, and entertain ourselves.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  const [q1] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "What was the original name of the Internet project?",
    questionType: "SINGLE_CHOICE",
    order: 1,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q1.id, text: "ARPANET", correct: true, order: 1 },
    { questionId: q1.id, text: "World Wide Web", correct: false, order: 2 },
    { questionId: q1.id, text: "CERN", correct: false, order: 3 },
    { questionId: q1.id, text: "Google", correct: false, order: 4 },
  ]);

  // Question 2
  const [q2] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Who invented the World Wide Web?",
    questionType: "SINGLE_CHOICE",
    order: 2,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q2.id, text: "Tim Berners-Lee", correct: true, order: 1 },
    { questionId: q2.id, text: "Bill Gates", correct: false, order: 2 },
    { questionId: q2.id, text: "Steve Jobs", correct: false, order: 3 },
    { questionId: q2.id, text: "Mark Zuckerberg", correct: false, order: 4 },
  ]);

  // Question 3
  const [q3] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "How many people use the Internet today?",
    questionType: "SINGLE_CHOICE",
    order: 3,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q3.id, text: "Over 5 billion", correct: true, order: 1 },
    { questionId: q3.id, text: "400 million", correct: false, order: 2 },
    { questionId: q3.id, text: "1 billion", correct: false, order: 3 },
    { questionId: q3.id, text: "10 billion", correct: false, order: 4 },
  ]);

  console.log(`  ✅ Lesson 1: Multiple Choice - Single Answer (3 questions)`);
}

// Lesson 2: Multiple Choice (Multiple Answers)
async function createLesson2(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Multiple Choice - Multiple Answers")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 2 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Multiple Choice - Multiple Answers",
    description: "Choose MULTIPLE correct answers from options",
    unitId,
    order: 2,
    skillType: "READING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "READING_MULTIPLE_CHOICE",
    question: "Renewable Energy Sources",
    passage: `Renewable Energy Sources

Renewable energy comes from natural sources that are constantly replenished. Unlike fossil fuels, renewable energy sources produce little to no greenhouse gas emissions.

Solar power harnesses energy from the sun using photovoltaic panels. It's one of the fastest-growing energy sources and can be installed on rooftops or in large solar farms. Solar energy is clean, abundant, and becoming increasingly affordable.

Wind power uses turbines to convert wind energy into electricity. Wind farms can be built on land or offshore. Denmark generates over 40% of its electricity from wind power, demonstrating its viability as a major energy source.

Hydroelectric power generates electricity from flowing water. Dams are built to control water flow and drive turbines. It's the world's largest source of renewable electricity, providing about 16% of global electricity.

Geothermal energy uses heat from the Earth's core. Iceland generates 90% of its heating and hot water from geothermal sources. This energy source is reliable and available 24/7, unlike solar and wind which depend on weather conditions.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  const [q1] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Which renewable energy sources are mentioned in the passage? (Select ALL that apply)",
    questionType: "MULTIPLE_CHOICE",
    metadata: { maxSelections: 4 },
    order: 1,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q1.id, text: "Solar power", correct: true, order: 1 },
    { questionId: q1.id, text: "Wind power", correct: true, order: 2 },
    { questionId: q1.id, text: "Hydroelectric power", correct: true, order: 3 },
    { questionId: q1.id, text: "Geothermal energy", correct: true, order: 4 },
    { questionId: q1.id, text: "Nuclear power", correct: false, order: 5 },
  ]);

  // Question 2
  const [q2] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Which statements about renewable energy are TRUE? (Select ALL that apply)",
    questionType: "MULTIPLE_CHOICE",
    metadata: { maxSelections: 3 },
    order: 2,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q2.id, text: "They produce little greenhouse gas emissions", correct: true, order: 1 },
    { questionId: q2.id, text: "They are constantly replenished", correct: true, order: 2 },
    { questionId: q2.id, text: "Solar energy is becoming more affordable", correct: true, order: 3 },
    { questionId: q2.id, text: "They are more expensive than fossil fuels", correct: false, order: 4 },
  ]);

  console.log(`  ✅ Lesson 2: Multiple Choice - Multiple Answers (2 questions)`);
}

// Lesson 3: True/False/Not Given
async function createLesson3(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "True/False/Not Given")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 3 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "True/False/Not Given",
    description: "Identify if statements are True, False, or Not Given",
    unitId,
    order: 3,
    skillType: "READING",
    estimatedDuration: 25,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "READING_TRUE_FALSE_NOT_GIVEN",
    question: "The Benefits of Exercise",
    passage: `The Benefits of Regular Exercise

Regular physical exercise provides numerous health benefits. Studies show that people who exercise regularly have a 30% lower risk of heart disease compared to sedentary individuals. Exercise strengthens the heart muscle and improves blood circulation.

Exercise also benefits mental health. Physical activity releases endorphins, chemicals in the brain that act as natural mood elevators. Many doctors recommend exercise as part of treatment for depression and anxiety.

Weight management is another key benefit. Combined with a balanced diet, regular exercise helps maintain a healthy weight. The World Health Organization recommends at least 150 minutes of moderate exercise per week for adults.

Exercise improves sleep quality. People who exercise regularly report falling asleep faster and experiencing deeper sleep. However, exercising too close to bedtime may have the opposite effect for some individuals.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  const [q1] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Regular exercise reduces heart disease risk by 30%.",
    questionType: "SINGLE_CHOICE",
    order: 1,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q1.id, text: "True", correct: true, order: 1 },
    { questionId: q1.id, text: "False", correct: false, order: 2 },
    { questionId: q1.id, text: "Not Given", correct: false, order: 3 },
  ]);

  // Question 2
  const [q2] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Exercise is more effective than medication for treating depression.",
    questionType: "SINGLE_CHOICE",
    order: 2,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q2.id, text: "True", correct: false, order: 1 },
    { questionId: q2.id, text: "False", correct: false, order: 2 },
    { questionId: q2.id, text: "Not Given", correct: true, order: 3 },
  ]);

  // Question 3
  const [q3] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "WHO recommends 150 minutes of exercise per week for adults.",
    questionType: "SINGLE_CHOICE",
    order: 3,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q3.id, text: "True", correct: true, order: 1 },
    { questionId: q3.id, text: "False", correct: false, order: 2 },
    { questionId: q3.id, text: "Not Given", correct: false, order: 3 },
  ]);

  // Question 4
  const [q4] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Exercising before bedtime always improves sleep quality.",
    questionType: "SINGLE_CHOICE",
    order: 4,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q4.id, text: "True", correct: false, order: 1 },
    { questionId: q4.id, text: "False", correct: true, order: 2 },
    { questionId: q4.id, text: "Not Given", correct: false, order: 3 },
  ]);

  console.log(`  ✅ Lesson 3: True/False/Not Given (4 questions)`);
}

// Lesson 4: Matching Headings
async function createLesson4(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Matching Headings")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 4 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Matching Headings",
    description: "Match paragraphs with appropriate headings",
    unitId,
    order: 4,
    skillType: "READING",
    estimatedDuration: 25,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "READING_MATCHING_HEADINGS",
    question: "World Capitals and Their Features",
    passage: `World Capitals and Their Features

Paris, the capital of France, is renowned for its art, fashion, and culture. The city is home to world-famous museums like the Louvre and Musée d'Orsay. Its iconic landmarks include the Eiffel Tower and Notre-Dame Cathedral. Paris is often called the "City of Light" due to its role in the Age of Enlightenment.

Tokyo, Japan's capital, is a fascinating blend of traditional and modern. Ancient temples stand alongside futuristic skyscrapers. The city is known for its efficient public transportation, cutting-edge technology, and vibrant pop culture. Tokyo is also a culinary paradise with more Michelin-starred restaurants than any other city.

London, the capital of the United Kingdom, has a rich history spanning over 2,000 years. It's home to royal palaces, historic landmarks like Big Ben and Tower Bridge, and world-class museums. London is a global financial center and one of the most multicultural cities in the world.

Canberra, Australia's capital, was purpose-built as the nation's capital in 1913. Unlike other major Australian cities, Canberra was designed from scratch with wide boulevards and green spaces. It houses important national institutions including Parliament House and the Australian War Memorial.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  const [q1] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Match each capital city with its key characteristic",
    questionType: "MATCHING",
    metadata: {
      leftItems: ["Paris", "Tokyo", "London", "Canberra"],
      rightItems: [
        "Art and culture hub",
        "Blend of traditional and modern",
        "Global financial center",
        "Purpose-built capital city"
      ],
      correctPairs: {
        "Paris": "Art and culture hub",
        "Tokyo": "Blend of traditional and modern",
        "London": "Global financial center",
        "Canberra": "Purpose-built capital city"
      }
    },
    order: 1,
  }).returning();

  console.log(`  ✅ Lesson 4: Matching Headings (1 matching question)`);
}

// Lesson 5: Sentence Completion
async function createLesson5(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Sentence Completion")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 5 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Sentence Completion",
    description: "Complete sentences with words from the passage",
    unitId,
    order: 5,
    skillType: "READING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "READING_SENTENCE_COMPLETION",
    question: "The Water Cycle",
    passage: `The Water Cycle

The water cycle, also known as the hydrological cycle, describes the continuous movement of water on, above, and below the surface of the Earth. This process is driven by solar energy and gravity.

Evaporation is the first stage, where water from oceans, lakes, and rivers turns into water vapor due to heat from the sun. Plants also release water vapor through a process called transpiration.

The water vapor rises into the atmosphere where it cools and condenses to form clouds. This process is called condensation. Tiny water droplets or ice crystals cluster together to create visible clouds.

When the water droplets in clouds become too heavy, they fall back to Earth as precipitation. This can be in the form of rain, snow, sleet, or hail, depending on temperature conditions.

Once water reaches the ground, it either flows into rivers and oceans as runoff, or seeps into the ground as infiltration. Underground water is stored in aquifers and can remain there for thousands of years before returning to the surface.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Put the stages of the water cycle in the correct order",
    questionType: "ORDERING",
    metadata: {
      items: [
        { id: "1", text: "Evaporation - water turns into vapor" },
        { id: "2", text: "Condensation - vapor forms clouds" },
        { id: "3", text: "Precipitation - water falls as rain/snow" },
        { id: "4", text: "Runoff - water flows to rivers/oceans" },
        { id: "5", text: "Infiltration - water seeps into ground" },
      ],
      correctOrder: ["1", "2", "3", "4", "5"]
    },
    order: 1,
  });

  console.log(`  ✅ Lesson 5: Sentence Completion (1 ordering question)`);
}

// Lesson 6: Summary Completion
async function createLesson6(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Summary Completion")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 6 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Summary Completion",
    description: "Fill in the blanks to complete the summary",
    unitId,
    order: 6,
    skillType: "READING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "READING_SUMMARY_COMPLETION",
    question: "Climate Change",
    passage: `Climate Change and Global Warming

Climate change refers to long-term shifts in global temperatures and weather patterns. While climate change is natural, scientific evidence shows that human activities have been the main driver since the 1800s, primarily through burning fossil fuels like coal, oil, and gas.

Greenhouse gases trap heat in the Earth's atmosphere, causing global temperatures to rise. Carbon dioxide (CO2) is the primary greenhouse gas, accounting for about 75% of emissions. Methane and nitrous oxide are also significant contributors.

The effects of climate change are already visible. Global average temperatures have increased by approximately 1.1°C since pre-industrial times. Arctic ice is melting, sea levels are rising, and extreme weather events are becoming more frequent and severe.

Scientists warn that if global temperatures rise by more than 1.5°C, the consequences could be catastrophic. This includes widespread droughts, flooding, food shortages, and mass extinction of species. Urgent action is needed to reduce emissions and transition to renewable energy sources.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "What is the primary cause of climate change since the 1800s?",
    questionType: "TEXT_INPUT",
    correctAnswer: "burning fossil fuels",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["burning fossil fuels", "fossil fuels", "human activities"]
    },
    order: 1,
  });

  // Question 2
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Which gas accounts for about 75% of greenhouse gas emissions?",
    questionType: "TEXT_INPUT",
    correctAnswer: "carbon dioxide",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["carbon dioxide", "CO2", "co2"]
    },
    order: 2,
  });

  // Question 3
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "By how much have global temperatures increased since pre-industrial times?",
    questionType: "TEXT_INPUT",
    correctAnswer: "1.1°C",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["1.1°C", "1.1 degrees", "1.1C"]
    },
    order: 3,
  });

  // Question 4
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "What temperature increase threshold could lead to catastrophic consequences?",
    questionType: "TEXT_INPUT",
    correctAnswer: "1.5°C",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["1.5°C", "1.5 degrees", "1.5C"]
    },
    order: 4,
  });

  console.log(`  ✅ Lesson 6: Summary Completion (4 text input questions)`);
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

