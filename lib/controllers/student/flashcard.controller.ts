/**
 * Student Flashcard Learning Controller
 * Handles flashcard learning and progress tracking
 */

import db from "@/db/drizzle";
import {
  flashcardCategories,
  flashcards,
  flashcardProgress,
} from "@/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";

/**
 * Get all available flashcard categories
 */
export async function getAllCategories() {
  const categories = await db
    .select({
      id: flashcardCategories.id,
      name: flashcardCategories.name,
      description: flashcardCategories.description,
      flashcardCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${flashcards}
        WHERE ${flashcards.categoryId} = ${flashcardCategories.id}
      )`,
    })
    .from(flashcardCategories)
    .orderBy(desc(flashcardCategories.createdAt));

  return categories;
}

/**
 * Get flashcards for a category with user progress
 */
export async function getCategoryFlashcardsWithProgress(
  categoryId: number,
  userId: string
) {
  const flashcardsData = await db
    .select({
      id: flashcards.id,
      word: flashcards.word,
      definition: flashcards.definition,
      pronunciation: flashcards.pronunciation,
      example: flashcards.example,
      synonyms: flashcards.synonyms,
      antonyms: flashcards.antonyms,
      partOfSpeech: flashcards.partOfSpeech,
      audioUrl: flashcards.audioUrl,
      imageUrl: flashcards.imageUrl,
      difficulty: flashcards.difficulty,
      // Progress data
      progressId: flashcardProgress.id,
      status: flashcardProgress.status,
      correctCount: flashcardProgress.correctCount,
      incorrectCount: flashcardProgress.incorrectCount,
      lastReviewedAt: flashcardProgress.lastReviewedAt,
    })
    .from(flashcards)
    .leftJoin(
      flashcardProgress,
      and(
        eq(flashcardProgress.flashcardId, flashcards.id),
        eq(flashcardProgress.userId, userId)
      )
    )
    .where(eq(flashcards.categoryId, categoryId))
    .orderBy(desc(flashcards.createdAt));

  return flashcardsData;
}

/**
 * Update flashcard progress
 */
export async function updateFlashcardProgress(
  userId: string,
  flashcardId: number,
  isCorrect: boolean
) {
  // Check if progress exists
  const existingProgress = await db.query.flashcardProgress.findFirst({
    where: and(
      eq(flashcardProgress.userId, userId),
      eq(flashcardProgress.flashcardId, flashcardId)
    ),
  });

  if (existingProgress) {
    // Update existing progress
    const newCorrectCount = isCorrect
      ? existingProgress.correctCount + 1
      : existingProgress.correctCount;
    const newIncorrectCount = !isCorrect
      ? existingProgress.incorrectCount + 1
      : existingProgress.incorrectCount;

    // Determine status based on correct count
    let status = "LEARNING";
    if (newCorrectCount >= 5) {
      status = "MASTERED";
    } else if (newCorrectCount === 0 && newIncorrectCount === 0) {
      status = "NEW";
    }

    // Calculate next review date (spaced repetition)
    const nextReviewAt = new Date();
    if (status === "MASTERED") {
      nextReviewAt.setDate(nextReviewAt.getDate() + 7); // Review in 7 days
    } else if (status === "LEARNING") {
      nextReviewAt.setDate(nextReviewAt.getDate() + 1); // Review tomorrow
    }

    const [updated] = await db
      .update(flashcardProgress)
      .set({
        correctCount: newCorrectCount,
        incorrectCount: newIncorrectCount,
        status,
        lastReviewedAt: new Date(),
        nextReviewAt,
        updatedAt: new Date(),
      })
      .where(eq(flashcardProgress.id, existingProgress.id))
      .returning();

    return updated;
  } else {
    // Create new progress
    const nextReviewAt = new Date();
    nextReviewAt.setDate(nextReviewAt.getDate() + 1); // Review tomorrow

    const [created] = await db
      .insert(flashcardProgress)
      .values({
        userId,
        flashcardId,
        status: "LEARNING",
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1,
        lastReviewedAt: new Date(),
        nextReviewAt,
      })
      .returning();

    return created;
  }
}

/**
 * Get user's flashcard statistics
 */
export async function getUserFlashcardStats(userId: string) {
  const stats = await db
    .select({
      total: count(),
      status: flashcardProgress.status,
    })
    .from(flashcardProgress)
    .where(eq(flashcardProgress.userId, userId))
    .groupBy(flashcardProgress.status);

  const totalFlashcards = await db
    .select({ count: count() })
    .from(flashcards);

  return {
    totalAvailable: Number(totalFlashcards[0]?.count || 0),
    new: stats.find((s) => s.status === "NEW")?.total || 0,
    learning: stats.find((s) => s.status === "LEARNING")?.total || 0,
    mastered: stats.find((s) => s.status === "MASTERED")?.total || 0,
  };
}

