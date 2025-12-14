/**
 * Clear All Flashcards Data
 * Deletes all flashcards, categories, and progress
 */

import "dotenv/config";
import db from "@/db/drizzle";
import { flashcardCategories, flashcards, flashcardProgress } from "@/db/schema";

async function clearFlashcards() {
  try {
    console.log("🗑️  Clearing all flashcard data...");

    // Delete all progress (will cascade delete due to foreign key)
    await db.delete(flashcardProgress);
    console.log("✓ Deleted all flashcard progress");

    // Delete all flashcards (will cascade delete due to foreign key)
    await db.delete(flashcards);
    console.log("✓ Deleted all flashcards");

    // Delete all categories
    await db.delete(flashcardCategories);
    console.log("✓ Deleted all flashcard categories");

    console.log("✅ All flashcard data cleared successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing flashcards:", error);
    process.exit(1);
  }
}

clearFlashcards();

