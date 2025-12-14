import "dotenv/config";
import db from "@/db/drizzle";
import { tests, testSections, testQuestions, testQuestionOptions } from "@/db/schema";

async function seedNewTestStructure() {
  try {
    console.log("🌱 Seeding test with new structure...");

    // Create a Reading Test
    const [readingTest] = await db
      .insert(tests)
      .values({
        title: "IELTS Reading Practice Test",
        description: "Practice test for IELTS Reading with passages and multiple questions",
        imageSrc: "/uploads/images/reading-test.jpg",
        testType: "PRACTICE",
        examType: "IELTS",
        duration: 60,
      })
      .returning();

    console.log("✓ Created reading test:", readingTest.title);

    // Create Section 1: Reading Passage about Climate Change
    const [section1] = await db
      .insert(testSections)
      .values({
        testId: readingTest.id,
        title: "Reading Passage 1 - Climate Change",
        skillType: "READING",
        order: 1,
        duration: 20,
        passage: `
          <h2>Climate Change and Its Global Impact</h2>
          <p>Climate change represents one of the most significant challenges facing humanity in the 21st century. 
          The Earth's average temperature has risen by approximately 1.1°C since the pre-industrial era, primarily 
          due to human activities such as burning fossil fuels, deforestation, and industrial processes.</p>
          
          <p>The consequences of this warming are far-reaching and multifaceted. Rising sea levels threaten coastal 
          communities worldwide, while extreme weather events—including hurricanes, droughts, and floods—have become 
          more frequent and severe. These changes not only affect human populations but also disrupt ecosystems and 
          biodiversity across the planet.</p>
          
          <p>Scientists agree that immediate action is necessary to mitigate the worst effects of climate change. 
          This includes transitioning to renewable energy sources, implementing sustainable agricultural practices, 
          and developing technologies to capture and store carbon dioxide. International cooperation, as demonstrated 
          by agreements like the Paris Climate Accord, is essential for addressing this global crisis.</p>
        `,
        audioSrc: null,
      })
      .returning();

    console.log("✓ Created section 1 with passage");

    // Create questions for Section 1
    const questions1 = [
      {
        questionText: "What is the main topic of the passage?",
        order: 1,
        points: 1,
        options: [
          { text: "The history of climate science", isCorrect: false },
          { text: "Climate change and its global impact", isCorrect: true },
          { text: "Renewable energy technologies", isCorrect: false },
          { text: "The Paris Climate Accord", isCorrect: false },
        ],
      },
      {
        questionText: "According to the passage, by how much has Earth's average temperature risen?",
        order: 2,
        points: 1,
        options: [
          { text: "0.5°C", isCorrect: false },
          { text: "1.1°C", isCorrect: true },
          { text: "2.0°C", isCorrect: false },
          { text: "3.5°C", isCorrect: false },
        ],
      },
      {
        questionText: "Which of the following is NOT mentioned as a consequence of climate change?",
        order: 3,
        points: 1,
        options: [
          { text: "Rising sea levels", isCorrect: false },
          { text: "Extreme weather events", isCorrect: false },
          { text: "Ecosystem disruption", isCorrect: false },
          { text: "Increased agricultural productivity", isCorrect: true },
        ],
      },
      {
        questionText: "What does the passage suggest is essential for addressing climate change?",
        order: 4,
        points: 1,
        options: [
          { text: "Individual action only", isCorrect: false },
          { text: "Technological solutions only", isCorrect: false },
          { text: "International cooperation", isCorrect: true },
          { text: "Economic growth", isCorrect: false },
        ],
      },
    ];

    for (const q of questions1) {
      const [question] = await db
        .insert(testQuestions)
        .values({
          sectionId: section1.id,
          questionText: q.questionText,
          order: q.order,
          points: q.points,
        })
        .returning();

      // Add options
      for (let i = 0; i < q.options.length; i++) {
        await db.insert(testQuestionOptions).values({
          questionId: question.id,
          optionText: q.options[i].text,
          isCorrect: q.options[i].isCorrect,
          order: i + 1,
        });
      }

      console.log(`  ✓ Created question ${q.order}: ${q.questionText.substring(0, 50)}...`);
    }

    console.log("✅ Test seeded successfully with new structure!");
    console.log("\nStructure:");
    console.log("└── Reading Test");
    console.log("    └── Section 1: Climate Change (with shared passage)");
    console.log("        ├── Question 1 (4 options)");
    console.log("        ├── Question 2 (4 options)");
    console.log("        ├── Question 3 (4 options)");
    console.log("        └── Question 4 (4 options)");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding test:", error);
    process.exit(1);
  }
}

seedNewTestStructure();

