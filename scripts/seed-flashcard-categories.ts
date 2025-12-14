/**
 * Seed Flashcard Categories
 * Creates various flashcard categories for different topics
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { flashcardCategories, users } from "@/db/schema";
import { eq } from "drizzle-orm";

const categories = [
  {
    name: "IELTS Reading Vocabulary",
    description: "Essential vocabulary for IELTS Reading section - academic and formal words commonly found in reading passages",
  },
  {
    name: "IELTS Writing Task 2",
    description: "Advanced vocabulary for IELTS Writing Task 2 essays - opinion, discussion, and problem-solution topics",
  },
  {
    name: "IELTS Speaking Part 2",
    description: "Useful expressions and vocabulary for IELTS Speaking Part 2 long turn responses",
  },
  {
    name: "IELTS Listening Vocabulary",
    description: "Common words and phrases for IELTS Listening section - everyday situations and academic contexts",
  },
  {
    name: "Business English - Meetings",
    description: "Professional vocabulary for business meetings, presentations, and discussions",
  },
  {
    name: "Business English - Emails",
    description: "Formal expressions and phrases for professional email communication",
  },
  {
    name: "Business English - Negotiations",
    description: "Key vocabulary for business negotiations, deals, and agreements",
  },
  {
    name: "Academic Writing",
    description: "Formal academic vocabulary for research papers, essays, and dissertations",
  },
  {
    name: "Academic Presentations",
    description: "Useful phrases and vocabulary for academic presentations and conferences",
  },
  {
    name: "Common Phrasal Verbs",
    description: "Frequently used phrasal verbs in everyday English conversation",
  },
  {
    name: "English Idioms",
    description: "Popular English idioms and their meanings with example sentences",
  },
  {
    name: "Collocations",
    description: "Common word combinations that native speakers use naturally",
  },
  {
    name: "Technology Vocabulary",
    description: "Modern technology-related vocabulary for IT, software, and digital communication",
  },
  {
    name: "Medical English",
    description: "Medical terminology and healthcare vocabulary for professionals and students",
  },
  {
    name: "Legal English",
    description: "Legal terminology and vocabulary for law students and professionals",
  },
  {
    name: "Travel & Tourism",
    description: "Essential vocabulary for travel, hotels, airports, and tourist situations",
  },
  {
    name: "Food & Cooking",
    description: "Culinary vocabulary for cooking, recipes, and dining experiences",
  },
  {
    name: "Environment & Climate",
    description: "Vocabulary related to environmental issues, climate change, and sustainability",
  },
  {
    name: "Education & Learning",
    description: "Academic vocabulary related to education, teaching, and learning processes",
  },
  {
    name: "Finance & Economics",
    description: "Financial and economic terminology for business and personal finance",
  },
  {
    name: "Marketing & Advertising",
    description: "Marketing vocabulary for campaigns, branding, and consumer behavior",
  },
  {
    name: "Science & Research",
    description: "Scientific vocabulary for research, experiments, and scientific methods",
  },
  {
    name: "Social Media",
    description: "Modern vocabulary for social media platforms, online communication, and digital culture",
  },
  {
    name: "Sports & Fitness",
    description: "Sports terminology and fitness vocabulary for athletes and enthusiasts",
  },
  {
    name: "Arts & Culture",
    description: "Vocabulary related to arts, music, literature, and cultural events",
  },
];

async function seedCategories() {
  try {
    console.log("🌱 Seeding flashcard categories...");

    // Get first teacher from database
    const teacher = await db.query.users.findFirst({
      where: eq(users.role, "TEACHER"),
    });

    if (!teacher) {
      console.log("⚠️  No teacher found in database. Creating categories with default teacher ID.");
    }

    const teacherId = teacher?.userId || "default_teacher_id";

    // Create all categories
    let count = 0;
    for (const category of categories) {
      await db.insert(flashcardCategories).values({
        name: category.name,
        description: category.description,
        createdBy: teacherId,
      });
      count++;
      console.log(`  ✓ ${category.name}`);
    }

    console.log(`✅ Created ${count} flashcard categories successfully!`);
    console.log(`
Summary:
- ${count} categories created
- Ready to add flashcards!

Next steps:
1. Go to /teacher/flashcards
2. Click on a category
3. Add flashcards manually or use Dictionary Search
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();

