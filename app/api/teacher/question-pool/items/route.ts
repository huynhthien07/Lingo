/**
 * Question Items API (Shared Pool)
 * GET /api/teacher/question-pool/items?lessonId=123 - Get all items for a lesson
 * GET /api/teacher/question-pool/items?testId=456 - Get all items for a test
 * POST /api/teacher/question-pool/items - Create a new item
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questionItems } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// GET - Fetch all items for a challenge or test
export const GET = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const challengeId = searchParams.get("challengeId");
    const lessonId = searchParams.get("lessonId"); // DEPRECATED - for backward compatibility
    const testId = searchParams.get("testId");

    if (!challengeId && !lessonId && !testId) {
      return NextResponse.json(
        { error: "Either challengeId, lessonId, or testId is required" },
        { status: 400 }
      );
    }

    let items;
    if (challengeId) {
      // NEW: Fetch items for a specific challenge
      items = await db.query.questionItems.findMany({
        where: eq(questionItems.challengeId, parseInt(challengeId)),
        orderBy: (items, { asc }) => [asc(items.id)],
      });
    } else if (lessonId) {
      // DEPRECATED: Fetch items for entire lesson
      items = await db.query.questionItems.findMany({
        where: and(
          eq(questionItems.lessonId, parseInt(lessonId)),
          isNull(questionItems.testId)
        ),
        orderBy: (items, { asc }) => [asc(items.id)],
      });
    } else {
      // Fetch items for test
      items = await db.query.questionItems.findMany({
        where: and(
          eq(questionItems.testId, parseInt(testId!)),
          isNull(questionItems.lessonId)
        ),
        orderBy: (items, { asc }) => [asc(items.id)],
      });
    }

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch items" },
      { status: 500 }
    );
  }
};

// POST - Create a new item
export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { challengeId, lessonId, testId, text, imageSrc, audioSrc } = body;

    if ((!challengeId && !lessonId && !testId) || !text) {
      return NextResponse.json(
        { error: "Either challengeId, lessonId, or testId, and text are required" },
        { status: 400 }
      );
    }

    const [newItem] = await db
      .insert(questionItems)
      .values({
        challengeId: challengeId ? parseInt(challengeId) : null,
        lessonId: lessonId ? parseInt(lessonId) : null,
        testId: testId ? parseInt(testId) : null,
        text,
        imageSrc: imageSrc || null,
        audioSrc: audioSrc || null,
      })
      .returning();

    return NextResponse.json({ item: newItem });
  } catch (error: any) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create item" },
      { status: 500 }
    );
  }
};

