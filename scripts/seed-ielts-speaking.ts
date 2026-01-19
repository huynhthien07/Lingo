/**
 * Seed IELTS Speaking Skills
 * Creates speaking lessons (Part 1, 2, and 3)
 * Run with: npx tsx scripts/seed-ielts-speaking.ts
 */

import "dotenv/config";
import db from "../db/drizzle";
import { courses, units, lessons, challenges } from "../db/schema";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("🗣️  Starting IELTS Speaking Skills seeding...\n");

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

    // Create or find Unit for Speaking
    let unit = await db.query.units.findFirst({
      where: and(
        eq(units.courseId, course.id),
        eq(units.title, "Unit 4: Speaking Skills")
      ),
    });

    if (!unit) {
      const [newUnit] = await db.insert(units).values({
        title: "Unit 4: Speaking Skills",
        description: "Master IELTS Speaking Parts 1, 2, and 3",
        courseId: course.id,
        order: 4,
      }).returning();
      unit = newUnit;
      console.log(`✅ Created unit: ${unit.title}\n`);
    } else {
      console.log(`✅ Found unit: ${unit.title}\n`);
    }

    // Lesson 1: Part 1 - Introduction & Interview
    await createLesson1(unit.id);

    // Lesson 2: Part 2 - Individual Long Turn
    await createLesson2(unit.id);

    // Lesson 3: Part 3 - Two-way Discussion
    await createLesson3(unit.id);

    console.log("\n✅ Speaking Skills seeding completed!");
    console.log("📊 Summary: 3 lessons (Part 1, 2, and 3)");

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

// Lesson 1: Part 1 - Introduction & Interview
async function createLesson1(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Speaking Part 1 - Introduction & Interview")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 1 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Speaking Part 1 - Introduction & Interview",
    description: "Practice answering questions about familiar topics",
    unitId,
    order: 1,
    skillType: "SPEAKING",
    estimatedDuration: 15,
  }).returning();

  // Challenge 1: Work/Study
  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "SPEAKING_PART_1",
    question: "Work or Study",
    passage: `Part 1: Introduction and Interview (4-5 minutes)

The examiner will ask you general questions about yourself and familiar topics.

Topic: Work or Study

Sample Questions:
1. Do you work or are you a student?
2. What subject are you studying? / What do you do?
3. Why did you choose this subject/job?
4. What do you find most interesting about your studies/work?
5. What are your future career plans?

Tips for Part 1:
- Give extended answers (2-3 sentences)
- Don't just say "yes" or "no"
- Add reasons and examples
- Speak naturally and fluently
- Use a variety of vocabulary
- Maintain good pronunciation

Example Answer:
Q: What subject are you studying?
A: I'm currently studying Computer Science at university. I chose this field because I've always been fascinated by technology and how it shapes our modern world. I particularly enjoy programming and developing software applications.

Time: Aim for 20-30 seconds per answer`,
    order: 1,
    difficulty: "EASY",
    points: 15,
  });

  // Challenge 2: Hobbies
  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "SPEAKING_PART_1",
    question: "Hobbies and Interests",
    passage: `Topic: Hobbies and Interests

Sample Questions:
1. What do you like to do in your free time?
2. How long have you had this hobby?
3. Do you prefer indoor or outdoor activities?
4. Would you like to try any new hobbies in the future?
5. Do you think hobbies are important? Why?

Example Answer:
Q: What do you like to do in your free time?
A: In my free time, I really enjoy reading books, especially science fiction novels. I find it's a great way to relax and escape from daily stress. I also like going for walks in the park on weekends to get some fresh air and exercise.

Remember:
- Be honest and natural
- Use present simple for habits
- Use present continuous for current activities
- Add personal details to make answers interesting`,
    order: 2,
    difficulty: "EASY",
    points: 15,
  });

  console.log(`  ✅ Lesson 1: Speaking Part 1 - Introduction & Interview (2 challenges)`);
}

// Lesson 2: Part 2 - Individual Long Turn
async function createLesson2(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Speaking Part 2 - Individual Long Turn")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 2 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Speaking Part 2 - Individual Long Turn",
    description: "Practice speaking for 2 minutes on a given topic",
    unitId,
    order: 2,
    skillType: "SPEAKING",
    estimatedDuration: 20,
  }).returning();

  // Challenge 1: Describe a person
  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "SPEAKING_PART_2",
    question: "Describe a person who has influenced you",
    passage: `Part 2: Individual Long Turn (3-4 minutes)

You will be given a topic card. You have 1 minute to prepare and make notes. Then you must speak for 1-2 minutes.

Topic Card:

Describe a person who has influenced you in your life.

You should say:
• Who this person is
• How you know this person
• What this person has done to influence you
• And explain why this person has been important to you

Preparation Time: 1 minute
Speaking Time: 1-2 minutes

Tips for Part 2:
- Use all your preparation time to make notes
- Cover all bullet points on the card
- Speak for the full 2 minutes if possible
- Use past tenses to describe past events
- Use descriptive language and details
- Organize your answer logically
- Don't memorize answers - speak naturally

Sample Structure:
1. Introduction (10 seconds)
   - Briefly introduce the person

2. Main Points (80-90 seconds)
   - Cover each bullet point
   - Add specific examples and details

3. Conclusion (10-20 seconds)
   - Summarize why this person is important

Example Opening:
"I'd like to talk about my high school English teacher, Mrs. Johnson, who had a profound influence on my life. I first met her when I was 15 years old..."`,
    order: 1,
    difficulty: "MEDIUM",
    points: 20,
  });

  // Challenge 2: Describe a place
  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "SPEAKING_PART_2",
    question: "Describe a place you like to visit",
    passage: `Topic Card:

Describe a place you like to visit in your free time.

You should say:
• Where this place is
• How often you go there
• What you do there
• And explain why you like this place

Preparation Time: 1 minute
Speaking Time: 1-2 minutes

Useful Vocabulary:
- Location: situated, located, nestled, positioned
- Frequency: regularly, occasionally, from time to time, whenever I can
- Activities: relax, unwind, explore, enjoy, appreciate
- Feelings: peaceful, refreshing, inspiring, calming, energizing

Example Opening:
"The place I'd like to describe is a small coffee shop near my university called 'The Reading Corner.' It's located on a quiet street about 10 minutes' walk from campus..."

Remember to:
- Use present tenses for current habits
- Use descriptive adjectives
- Include sensory details (what you see, hear, smell)
- Express your feelings and opinions`,
    order: 2,
    difficulty: "MEDIUM",
    points: 20,
  });

  console.log(`  ✅ Lesson 2: Speaking Part 2 - Individual Long Turn (2 challenges)`);
}

// Lesson 3: Part 3 - Two-way Discussion
async function createLesson3(unitId: number) {
  let lesson = await db.query.lessons.findFirst({
    where: and(
      eq(lessons.unitId, unitId),
      eq(lessons.title, "Speaking Part 3 - Two-way Discussion")
    ),
  });

  if (lesson) {
    console.log(`  ℹ️  Lesson 3 exists, skipping...`);
    return;
  }

  const [newLesson] = await db.insert(lessons).values({
    title: "Speaking Part 3 - Two-way Discussion",
    description: "Practice discussing abstract topics in depth",
    unitId,
    order: 3,
    skillType: "SPEAKING",
    estimatedDuration: 20,
  }).returning();

  // Challenge 1: Education
  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "SPEAKING_PART_3",
    question: "Education and Learning",
    passage: `Part 3: Two-way Discussion (4-5 minutes)

The examiner will ask you more abstract questions related to the Part 2 topic.

Topic: Education and Learning

Sample Questions:

1. How has education changed in your country over the past few decades?
2. Do you think traditional classroom learning is still relevant in the digital age?
3. What role should technology play in education?
4. Should university education be free for everyone? Why or why not?
5. How important is it for people to continue learning throughout their lives?

Tips for Part 3:
- Give longer, more developed answers (40-60 seconds)
- Express and justify your opinions
- Consider different perspectives
- Use complex sentence structures
- Use advanced vocabulary
- Give examples to support your points
- Use discourse markers (However, Moreover, On the other hand)

Example Answer:
Q: How has education changed in your country?

A: "Well, I think education has undergone significant transformations in recent years. Firstly, there's been a major shift towards technology integration in classrooms. When I was in primary school, we rarely used computers, but nowadays, students use tablets and online platforms regularly.

Moreover, teaching methods have become more student-centered. Rather than just listening to lectures, students are encouraged to participate actively through group discussions and projects. This approach helps develop critical thinking skills.

However, I believe there are still challenges. Not all schools have equal access to resources, which creates disparities in educational quality. The government needs to address this to ensure all students have equal opportunities."

Key Language:
- Firstly, Secondly, Finally
- In my opinion, I believe, I think
- On the one hand... On the other hand
- For example, For instance
- However, Nevertheless, Although`,
    order: 1,
    difficulty: "HARD",
    points: 25,
  });

  // Challenge 2: Technology
  await db.insert(challenges).values({
    lessonId: newLesson.id,
    type: "SPEAKING_PART_3",
    question: "Technology and Society",
    passage: `Topic: Technology and Society

Sample Questions:

1. How has technology changed the way people communicate?
2. What are the advantages and disadvantages of social media?
3. Do you think people rely too much on technology nowadays?
4. How might technology change our lives in the future?
5. Should there be limits on children's use of technology?

Advanced Vocabulary:
- Impact: profound, significant, far-reaching, transformative
- Change: revolutionize, transform, reshape, alter
- Technology: innovation, advancement, breakthrough, development
- Society: community, population, citizens, individuals

Useful Phrases:
- "It's widely acknowledged that..."
- "There's no denying that..."
- "One could argue that..."
- "From my perspective..."
- "Taking everything into account..."

Example Answer:
Q: What are the advantages and disadvantages of social media?

A: "That's an interesting question. Social media certainly has both positive and negative aspects. On the positive side, it has revolutionized how we stay connected with friends and family, especially those living far away. It's also become an invaluable tool for businesses to reach customers and for people to access information quickly.

On the flip side, there are legitimate concerns about privacy and mental health. Studies have shown that excessive social media use can lead to anxiety and depression, particularly among young people who compare themselves to others. Additionally, the spread of misinformation is a serious problem that platforms are still struggling to address.

In my view, the key is finding a balance. Social media itself isn't inherently good or bad - it's how we use it that matters. We need better digital literacy education to help people use these platforms responsibly."`,
    order: 2,
    difficulty: "HARD",
    points: 25,
  });

  console.log(`  ✅ Lesson 3: Speaking Part 3 - Two-way Discussion (2 challenges)`);
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

