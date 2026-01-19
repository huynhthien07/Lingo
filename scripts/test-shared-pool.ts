/**
 * Test script for shared question pool (labels & items)
 * Tests both lesson-scoped and test-scoped pools
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { questionLabels, questionItems, lessons, tests } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

async function testSharedPool() {
  console.log("🧪 Testing Shared Question Pool\n");

  try {
    // 1. Find a lesson for testing
    console.log("1️⃣ Finding a lesson for testing...");
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.skillType, "READING"),
    });

    if (!lesson) {
      console.log("❌ No lesson found. Please create a lesson first.");
      return;
    }

    console.log(`✅ Found lesson: ${lesson.title} (ID: ${lesson.id})\n`);

    // 2. Create labels for the lesson
    console.log("2️⃣ Creating labels for lesson...");
    const [label1, label2, label3] = await db
      .insert(questionLabels)
      .values([
        {
          text: "Capital City",
          lessonId: lesson.id,
          testId: null,
        },
        {
          text: "Population",
          lessonId: lesson.id,
          testId: null,
        },
        {
          text: "Currency",
          lessonId: lesson.id,
          testId: null,
        },
      ])
      .returning();

    console.log(`✅ Created ${3} labels for lesson ${lesson.id}`);
    console.log(`   - ${label1.text} (ID: ${label1.id})`);
    console.log(`   - ${label2.text} (ID: ${label2.id})`);
    console.log(`   - ${label3.text} (ID: ${label3.id})\n`);

    // 3. Create items for the lesson
    console.log("3️⃣ Creating items for lesson...");
    const [item1, item2, item3] = await db
      .insert(questionItems)
      .values([
        {
          text: "Tokyo",
          lessonId: lesson.id,
          testId: null,
        },
        {
          text: "126 million",
          lessonId: lesson.id,
          testId: null,
        },
        {
          text: "Japanese Yen",
          lessonId: lesson.id,
          testId: null,
        },
      ])
      .returning();

    console.log(`✅ Created ${3} items for lesson ${lesson.id}`);
    console.log(`   - ${item1.text} (ID: ${item1.id})`);
    console.log(`   - ${item2.text} (ID: ${item2.id})`);
    console.log(`   - ${item3.text} (ID: ${item3.id})\n`);

    // 4. Find a test for testing
    console.log("4️⃣ Finding a test for testing...");
    const test = await db.query.tests.findFirst();

    if (!test) {
      console.log("⚠️ No test found. Skipping test-scoped pool test.\n");
    } else {
      console.log(`✅ Found test: ${test.title} (ID: ${test.id})\n`);

      // 5. Create labels for the test
      console.log("5️⃣ Creating labels for test...");
      const [testLabel1, testLabel2] = await db
        .insert(questionLabels)
        .values([
          {
            text: "Listening Part 1",
            lessonId: null,
            testId: test.id,
          },
          {
            text: "Listening Part 2",
            lessonId: null,
            testId: test.id,
          },
        ])
        .returning();

      console.log(`✅ Created ${2} labels for test ${test.id}`);
      console.log(`   - ${testLabel1.text} (ID: ${testLabel1.id})`);
      console.log(`   - ${testLabel2.text} (ID: ${testLabel2.id})\n`);

      // 6. Create items for the test
      console.log("6️⃣ Creating items for test...");
      const [testItem1, testItem2] = await db
        .insert(questionItems)
        .values([
          {
            text: "Conversation",
            lessonId: null,
            testId: test.id,
          },
          {
            text: "Monologue",
            lessonId: null,
            testId: test.id,
          },
        ])
        .returning();

      console.log(`✅ Created ${2} items for test ${test.id}`);
      console.log(`   - ${testItem1.text} (ID: ${testItem1.id})`);
      console.log(`   - ${testItem2.text} (ID: ${testItem2.id})\n`);
    }

    // 7. Verify isolation
    console.log("7️⃣ Verifying pool isolation...");
    const lessonLabels = await db.query.questionLabels.findMany({
      where: and(
        eq(questionLabels.lessonId, lesson.id),
        isNull(questionLabels.testId)
      ),
    });

    console.log(`✅ Lesson ${lesson.id} has ${lessonLabels.length} labels (should be 3)`);

    if (test) {
      const testLabels = await db.query.questionLabels.findMany({
        where: and(
          eq(questionLabels.testId, test.id),
          isNull(questionLabels.lessonId)
        ),
      });

      console.log(`✅ Test ${test.id} has ${testLabels.length} labels (should be 2)`);
    }

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

testSharedPool()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

