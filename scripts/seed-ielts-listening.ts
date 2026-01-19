/**
 * Seed IELTS Listening Skills
 * Creates listening lessons with various question types
 * Run with: npx tsx scripts/seed-ielts-listening.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges, questions, challengeOptions } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("🎧 Starting IELTS Listening Skills seeding...\n");

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

    // Create or find Unit for Listening
    let unit = await db.query.units.findFirst({
      where: and(
        eq(units.courseId, course.id),
        eq(units.title, "Unit 2: Listening Skills")
      ),
    });

    if (!unit) {
      const [newUnit] = await db.insert(units).values({
        title: "Unit 2: Listening Skills",
        description: "Master IELTS Listening question types",
        courseId: course.id,
        order: 2,
      }).returning();
      unit = newUnit;
      console.log(`✅ Created unit: ${unit.title}\n`);
    } else {
      console.log(`✅ Found unit: ${unit.title}\n`);
    }

    // Lesson 1: Multiple Choice
    await createLesson1(unit.id);

    // Lesson 2: Form Completion
    await createLesson2(unit.id);

    // Lesson 3: Map Labeling
    await createLesson3(unit.id);

    // Lesson 4: Short Answer
    await createLesson4(unit.id);

    console.log("\n✅ Listening Skills seeding completed!");
    console.log("📊 Summary: 4 lessons, 15+ questions");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Lesson 1: Multiple Choice
async function createLesson1(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Listening - Multiple Choice")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 1 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Listening - Multiple Choice",
    description: "Listen and choose the correct answer",
    unitId,
    order: 1,
    skillType: "LISTENING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "LISTENING_MULTIPLE_CHOICE",
    question: "University Orientation",
    audioSrc: "/audio/university-orientation.mp3",
    passage: `Audio Transcript:
Welcome to Greenfield University! I'm Sarah, and I'll be your guide today. Let me tell you about our campus facilities.

The main library is open 24 hours during exam periods, but normally it closes at 10 PM on weekdays and 6 PM on weekends. We have over 500,000 books and access to thousands of online journals.

Our sports center has a swimming pool, gym, and tennis courts. Student membership costs £50 per semester, which is quite affordable. The center is open from 6 AM to 11 PM daily.

For accommodation, we have three residence halls. North Hall is the newest, built in 2020. It has single rooms with private bathrooms. South Hall and East Hall have shared facilities but are more affordable.

The student union building is the heart of campus social life. It has a café, bookshop, and meeting rooms for student clubs. There are over 100 clubs you can join, from drama to robotics.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  const [q1] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "When does the library normally close on weekdays?",
    questionType: "SINGLE_CHOICE",
    order: 1,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q1.id, text: "10 PM", correct: true, order: 1 },
    { questionId: q1.id, text: "6 PM", correct: false, order: 2 },
    { questionId: q1.id, text: "11 PM", correct: false, order: 3 },
    { questionId: q1.id, text: "24 hours", correct: false, order: 4 },
  ]);

  // Question 2
  const [q2] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "How much does sports center membership cost per semester?",
    questionType: "SINGLE_CHOICE",
    order: 2,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q2.id, text: "£50", correct: true, order: 1 },
    { questionId: q2.id, text: "£100", correct: false, order: 2 },
    { questionId: q2.id, text: "£25", correct: false, order: 3 },
    { questionId: q2.id, text: "Free", correct: false, order: 4 },
  ]);

  // Question 3
  const [q3] = await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Which residence hall is the newest?",
    questionType: "SINGLE_CHOICE",
    order: 3,
  }).returning();

  await db.insert(challengeOptions).values([
    { questionId: q3.id, text: "North Hall", correct: true, order: 1 },
    { questionId: q3.id, text: "South Hall", correct: false, order: 2 },
    { questionId: q3.id, text: "East Hall", correct: false, order: 3 },
    { questionId: q3.id, text: "West Hall", correct: false, order: 4 },
  ]);

  console.log(`  ✅ Lesson 1: Listening - Multiple Choice (3 questions)`);
}

// Lesson 2: Form Completion
async function createLesson2(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Listening - Form Completion")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 2 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Listening - Form Completion",
    description: "Listen and complete the form with correct information",
    unitId,
    order: 2,
    skillType: "LISTENING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "LISTENING_FORM_COMPLETION",
    question: "Hotel Booking",
    audioSrc: "/audio/hotel-booking.mp3",
    passage: `Audio Transcript:
Receptionist: Good morning, Grand Hotel. How may I help you?
Customer: Hi, I'd like to make a reservation for next week.
Receptionist: Certainly. May I have your name, please?
Customer: Yes, it's Jennifer Thompson. That's T-H-O-M-P-S-O-N.
Receptionist: Thank you, Ms. Thompson. What dates are you looking at?
Customer: I need a room from June 15th to June 18th. That's three nights.
Receptionist: Perfect. And how many guests?
Customer: Just two adults. My husband and I.
Receptionist: Would you prefer a double room or twin beds?
Customer: A double room, please. Do you have one with a sea view?
Receptionist: Yes, we do. The sea view room is £150 per night.
Customer: That sounds good. I'll take it.
Receptionist: Excellent. May I have a contact number?
Customer: Sure, it's 07700 900123.
Receptionist: And your email address?
Customer: It's j.thompson@email.com
Receptionist: Perfect. Your booking is confirmed. The total is £450 for three nights.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Guest surname:",
    questionType: "TEXT_INPUT",
    correctAnswer: "Thompson",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["Thompson"]
    },
    order: 1,
  });

  // Question 2
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Check-in date:",
    questionType: "TEXT_INPUT",
    correctAnswer: "June 15th",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["June 15th", "15 June", "15/06"]
    },
    order: 2,
  });

  // Question 3
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Number of nights:",
    questionType: "TEXT_INPUT",
    correctAnswer: "3",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["3", "three"]
    },
    order: 3,
  });

  // Question 4
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Room type:",
    questionType: "TEXT_INPUT",
    correctAnswer: "double room",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["double room", "double", "sea view double"]
    },
    order: 4,
  });

  // Question 5
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Total cost:",
    questionType: "TEXT_INPUT",
    correctAnswer: "£450",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["£450", "450", "450 pounds"]
    },
    order: 5,
  });

  console.log(`  ✅ Lesson 2: Listening - Form Completion (5 questions)`);
}

// Lesson 3: Map Labeling
async function createLesson3(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Listening - Map Labeling")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 3 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Listening - Map Labeling",
    description: "Listen and label locations on a map",
    unitId,
    order: 3,
    skillType: "LISTENING",
    estimatedDuration: 25,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "LISTENING_MAP_LABELLING",
    question: "Campus Tour",
    audioSrc: "/audio/campus-tour.mp3",
    imageSrc: "/images/campus-map.png",
    passage: `Audio Transcript:
Welcome to our campus tour! Let me show you the main buildings.

As you enter through the main gate, the Administration Building is directly in front of you. It's the tall building with the clock tower.

To the left of the Administration Building, you'll find the Library. It's a modern glass building that opened last year.

Behind the Library, there's the Science Block. You can't miss it - it has solar panels on the roof.

On the right side of the Administration Building is the Student Center. This is where you'll find the cafeteria and student services.

Behind the Student Center is the Sports Complex. It includes a gym, swimming pool, and basketball courts.

Finally, at the back of the campus, you'll see the Lecture Halls. There are three large lecture theaters there.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "Label the campus buildings on the map",
    questionType: "LABELING",
    metadata: {
      labels: [
        { id: "1", text: "Administration Building", x: 50, y: 30, correctLabel: "Administration Building" },
        { id: "2", text: "Library", x: 30, y: 30, correctLabel: "Library" },
        { id: "3", text: "Science Block", x: 30, y: 50, correctLabel: "Science Block" },
        { id: "4", text: "Student Center", x: 70, y: 30, correctLabel: "Student Center" },
        { id: "5", text: "Sports Complex", x: 70, y: 50, correctLabel: "Sports Complex" },
      ],
      availableLabels: [
        "Administration Building",
        "Library",
        "Science Block",
        "Student Center",
        "Sports Complex",
        "Lecture Halls"
      ]
    },
    order: 1,
  });

  console.log(`  ✅ Lesson 3: Listening - Map Labeling (1 labeling question)`);
}

// Lesson 4: Short Answer
async function createLesson4(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Listening - Short Answer")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 4 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Listening - Short Answer",
    description: "Listen and answer questions with short answers",
    unitId,
    order: 4,
    skillType: "LISTENING",
    estimatedDuration: 20,
  }).returning();

  const [challenge] = await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "LISTENING_SHORT_ANSWER",
    question: "Museum Information",
    audioSrc: "/audio/museum-info.mp3",
    passage: `Audio Transcript:
Thank you for calling the National History Museum. Here's some information about visiting us.

The museum is open Tuesday to Sunday, from 9 AM to 5 PM. We're closed on Mondays except for public holidays.

Adult tickets cost £15, and children under 16 get in free. Students and seniors pay a reduced price of £10 with valid ID.

Our special exhibition this month is "Ancient Egypt: Treasures of the Pharaohs." It features over 200 artifacts including mummies, jewelry, and hieroglyphic tablets. This exhibition runs until the end of September.

We offer guided tours at 11 AM and 2 PM daily. Tours last approximately 90 minutes and are included in your ticket price.

The museum café is located on the ground floor and serves light meals and refreshments. There's also a gift shop where you can buy souvenirs and books.

For more information, visit our website at www.nationalhistorymuseum.org or call us at 020 7946 0958.`,
    order: 1,
    difficulty: "MEDIUM",
    points: 10,
  }).returning();

  // Question 1
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "What day is the museum closed?",
    questionType: "TEXT_INPUT",
    correctAnswer: "Monday",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["Monday", "Mondays"]
    },
    order: 1,
  });

  // Question 2
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "How much do adult tickets cost?",
    questionType: "TEXT_INPUT",
    correctAnswer: "£15",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["£15", "15", "15 pounds"]
    },
    order: 2,
  });

  // Question 3
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "What is the name of the special exhibition?",
    questionType: "TEXT_INPUT",
    correctAnswer: "Ancient Egypt: Treasures of the Pharaohs",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["Ancient Egypt: Treasures of the Pharaohs", "Ancient Egypt", "Treasures of the Pharaohs"]
    },
    order: 3,
  });

  // Question 4
  await db.insert(questions).values({
    challengeId: challenge.id,
    text: "How long do guided tours last?",
    questionType: "TEXT_INPUT",
    correctAnswer: "90 minutes",
    metadata: {
      caseSensitive: false,
      acceptableAnswers: ["90 minutes", "90 mins", "1.5 hours"]
    },
    order: 4,
  });

  console.log(`  ✅ Lesson 4: Listening - Short Answer (4 questions)`);
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

