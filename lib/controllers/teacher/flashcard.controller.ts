/**
 * Teacher Flashcard Management Controller
 * Handles CRUD operations for flashcard categories and flashcards
 */

import db from "@/db/drizzle";
import { flashcardCategories, flashcards, users } from "@/db/schema";
import { eq, and, desc, asc, ilike, or, sql, count } from "drizzle-orm";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user is admin
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
  return user?.role === "ADMIN";
}

// ============================================================================
// FLASHCARD CATEGORIES
// ============================================================================

/**
 * Get all categories for a teacher
 * Admin can see all categories, teachers only see their own
 */
export async function getTeacherCategories(teacherId: string) {
  const isAdmin = await isUserAdmin(teacherId);

  const categories = await db
    .select({
      id: flashcardCategories.id,
      name: flashcardCategories.name,
      description: flashcardCategories.description,
      createdBy: flashcardCategories.createdBy,
      createdAt: flashcardCategories.createdAt,
      flashcardCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${flashcards}
        WHERE ${flashcards.categoryId} = ${flashcardCategories.id}
      )`,
    })
    .from(flashcardCategories)
    .where(isAdmin ? undefined : eq(flashcardCategories.createdBy, teacherId))
    .orderBy(desc(flashcardCategories.createdAt));

  return categories;
}

/**
 * Get category by ID
 */
export async function getCategoryById(categoryId: number, teacherId: string) {
  const isAdmin = await isUserAdmin(teacherId);

  const category = await db.query.flashcardCategories.findFirst({
    where: isAdmin
      ? eq(flashcardCategories.id, categoryId)
      : and(
          eq(flashcardCategories.id, categoryId),
          eq(flashcardCategories.createdBy, teacherId)
        ),
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

/**
 * Create new category
 */
export async function createCategory(teacherId: string, data: {
  name: string;
  description?: string;
}) {
  const [category] = await db
    .insert(flashcardCategories)
    .values({
      name: data.name,
      description: data.description || null,
      createdBy: teacherId,
    })
    .returning();

  return category;
}

/**
 * Update category
 */
export async function updateCategory(
  categoryId: number,
  teacherId: string,
  data: {
    name?: string;
    description?: string;
  }
) {
  const isAdmin = await isUserAdmin(teacherId);

  const [category] = await db
    .update(flashcardCategories)
    .set({
      name: data.name,
      description: data.description,
      updatedAt: new Date(),
    })
    .where(
      isAdmin
        ? eq(flashcardCategories.id, categoryId)
        : and(
            eq(flashcardCategories.id, categoryId),
            eq(flashcardCategories.createdBy, teacherId)
          )
    )
    .returning();

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}

/**
 * Delete category
 */
export async function deleteCategory(categoryId: number, teacherId: string) {
  const isAdmin = await isUserAdmin(teacherId);

  await db
    .delete(flashcardCategories)
    .where(
      isAdmin
        ? eq(flashcardCategories.id, categoryId)
        : and(
            eq(flashcardCategories.id, categoryId),
            eq(flashcardCategories.createdBy, teacherId)
          )
    );

  return { success: true };
}

// ============================================================================
// FLASHCARDS
// ============================================================================

/**
 * Get flashcards for a category
 */
export async function getCategoryFlashcards(
  categoryId: number,
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
) {
  const { page = 1, limit = 20, search = "" } = options;
  const offset = (page - 1) * limit;

  // Verify category belongs to teacher
  await getCategoryById(categoryId, teacherId);

  // Build where conditions
  const conditions: any[] = [eq(flashcards.categoryId, categoryId)];

  if (search) {
    conditions.push(
      or(
        ilike(flashcards.word, `%${search}%`),
        ilike(flashcards.definition, `%${search}%`)
      )
    );
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(flashcards)
    .where(whereClause);

  // Get paginated data
  const data = await db
    .select()
    .from(flashcards)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(flashcards.createdAt));

  return {
    data,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
}

/**
 * Get flashcard by ID
 */
export async function getFlashcardById(
  flashcardId: number,
  teacherId: string
) {
  const flashcard = await db.query.flashcards.findFirst({
    where: eq(flashcards.id, flashcardId),
    with: {
      category: true,
    },
  });

  if (!flashcard) {
    throw new Error("Flashcard not found");
  }

  // Verify category belongs to teacher
  if (flashcard.category.createdBy !== teacherId) {
    throw new Error("Unauthorized");
  }

  return flashcard;
}

/**
 * Create new flashcard
 */
export async function createFlashcard(
  teacherId: string,
  data: {
    categoryId: number;
    word: string;
    definition: string;
    pronunciation?: string;
    example?: string;
    synonyms?: string;
    antonyms?: string;
    partOfSpeech?: string;
    audioUrl?: string;
    imageUrl?: string;
    difficulty?: string;
    source?: string;
  }
) {
  // Verify category belongs to teacher
  await getCategoryById(data.categoryId, teacherId);

  const [flashcard] = await db
    .insert(flashcards)
    .values({
      categoryId: data.categoryId,
      word: data.word,
      definition: data.definition,
      pronunciation: data.pronunciation || null,
      example: data.example || null,
      synonyms: data.synonyms || null,
      antonyms: data.antonyms || null,
      partOfSpeech: data.partOfSpeech || null,
      audioUrl: data.audioUrl || null,
      imageUrl: data.imageUrl || null,
      difficulty: data.difficulty || null,
      source: data.source || "MANUAL",
      createdBy: teacherId,
    })
    .returning();

  return flashcard;
}

/**
 * Update flashcard
 */
export async function updateFlashcard(
  flashcardId: number,
  teacherId: string,
  data: Partial<{
    word: string;
    definition: string;
    pronunciation: string;
    example: string;
    synonyms: string;
    antonyms: string;
    partOfSpeech: string;
    audioUrl: string;
    imageUrl: string;
    difficulty: string;
  }>
) {
  // Verify flashcard belongs to teacher
  await getFlashcardById(flashcardId, teacherId);

  const [flashcard] = await db
    .update(flashcards)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(flashcards.id, flashcardId))
    .returning();

  return flashcard;
}

/**
 * Delete flashcard
 */
export async function deleteFlashcard(flashcardId: number, teacherId: string) {
  // Verify flashcard belongs to teacher
  await getFlashcardById(flashcardId, teacherId);

  await db.delete(flashcards).where(eq(flashcards.id, flashcardId));

  return { success: true };
}

