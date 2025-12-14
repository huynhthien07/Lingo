/**
 * Seed Flashcards Data
 * Creates sample flashcard categories and flashcards for testing
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { flashcardCategories, flashcards, users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function seedFlashcards() {
  try {
    console.log("🌱 Seeding flashcards...");

    // Get first teacher from database
    const teacher = await db.query.users.findFirst({
      where: eq(users.role, "TEACHER"),
    });

    if (!teacher) {
      console.log("⚠️  No teacher found in database. Creating flashcards with a default teacher ID.");
      console.log("⚠️  You can update the createdBy field later with an actual teacher ID.");
    }

    const teacherId = teacher?.userId || "default_teacher_id";

    // Create categories
    const [category1] = await db
      .insert(flashcardCategories)
      .values({
        name: "IELTS Academic Vocabulary",
        description: "Essential academic words for IELTS preparation",
        createdBy: teacherId,
      })
      .returning();

    const [category2] = await db
      .insert(flashcardCategories)
      .values({
        name: "Common English Idioms",
        description: "Frequently used idioms in English",
        createdBy: teacherId,
      })
      .returning();

    console.log("✓ Created categories");

    // Create flashcards for category 1
    await db.insert(flashcards).values([
      {
        categoryId: category1.id,
        word: "Analyze",
        definition: "To examine something in detail in order to understand it better",
        pronunciation: "/ˈænəlaɪz/",
        example: "We need to analyze the data before making a decision.",
        synonyms: "examine, study, investigate",
        antonyms: "ignore, overlook",
        partOfSpeech: "verb",
        difficulty: "MEDIUM",
        source: "MANUAL",
        createdBy: teacherId,
      },
      {
        categoryId: category1.id,
        word: "Significant",
        definition: "Important or noticeable",
        pronunciation: "/sɪɡˈnɪfɪkənt/",
        example: "There has been a significant improvement in his performance.",
        synonyms: "important, notable, considerable",
        antonyms: "insignificant, trivial",
        partOfSpeech: "adjective",
        difficulty: "MEDIUM",
        source: "MANUAL",
        createdBy: teacherId,
      },
      {
        categoryId: category1.id,
        word: "Hypothesis",
        definition: "An idea or explanation that you test through study and experimentation",
        pronunciation: "/haɪˈpɑːθəsɪs/",
        example: "The scientist proposed a hypothesis about climate change.",
        synonyms: "theory, assumption, proposition",
        antonyms: "fact, certainty",
        partOfSpeech: "noun",
        difficulty: "HARD",
        source: "MANUAL",
        createdBy: teacherId,
      },
      {
        categoryId: category1.id,
        word: "Demonstrate",
        definition: "To show or make something clear",
        pronunciation: "/ˈdemənstreɪt/",
        example: "The teacher demonstrated how to solve the equation.",
        synonyms: "show, illustrate, prove",
        antonyms: "hide, conceal",
        partOfSpeech: "verb",
        difficulty: "MEDIUM",
        source: "MANUAL",
        createdBy: teacherId,
      },
      {
        categoryId: category1.id,
        word: "Comprehensive",
        definition: "Complete and including everything that is necessary",
        pronunciation: "/ˌkɑːmprɪˈhensɪv/",
        example: "The report provides a comprehensive overview of the situation.",
        synonyms: "complete, thorough, extensive",
        antonyms: "incomplete, partial",
        partOfSpeech: "adjective",
        difficulty: "HARD",
        source: "MANUAL",
        createdBy: teacherId,
      },
    ]);

    console.log("✓ Created flashcards for IELTS Academic Vocabulary");

    // Create flashcards for category 2
    await db.insert(flashcards).values([
      {
        categoryId: category2.id,
        word: "Break the ice",
        definition: "To make people feel more comfortable in a social situation",
        example: "He told a joke to break the ice at the meeting.",
        partOfSpeech: "idiom",
        difficulty: "EASY",
        source: "MANUAL",
        createdBy: teacherId,
      },
      {
        categoryId: category2.id,
        word: "Piece of cake",
        definition: "Something that is very easy to do",
        example: "The exam was a piece of cake for her.",
        synonyms: "easy, simple",
        antonyms: "difficult, challenging",
        partOfSpeech: "idiom",
        difficulty: "EASY",
        source: "MANUAL",
        createdBy: teacherId,
      },
      {
        categoryId: category2.id,
        word: "Hit the nail on the head",
        definition: "To describe exactly what is causing a situation or problem",
        example: "You hit the nail on the head with that analysis.",
        partOfSpeech: "idiom",
        difficulty: "MEDIUM",
        source: "MANUAL",
        createdBy: teacherId,
      },
    ]);

    console.log("✓ Created flashcards for Common English Idioms");

    console.log("✅ Flashcards seeded successfully!");
    console.log(`
Summary:
- 2 categories created
- 8 flashcards created
- Ready to test!
    `);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding flashcards:", error);
    process.exit(1);
  }
}

seedFlashcards();

