/**
 * Question Labels API (Shared Pool)
 * GET /api/teacher/question-pool/labels?lessonId=123 - Get all labels for a lesson
 * GET /api/teacher/question-pool/labels?testId=456 - Get all labels for a test
 * POST /api/teacher/question-pool/labels - Create a new label
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { questionLabels } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

// GET - Fetch all labels for a challenge or test
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

    let labels;
    if (challengeId) {
      // NEW: Fetch labels for a specific challenge
      labels = await db.query.questionLabels.findMany({
        where: eq(questionLabels.challengeId, parseInt(challengeId)),
        orderBy: (labels, { asc }) => [asc(labels.id)],
      });
    } else if (lessonId) {
      // DEPRECATED: Fetch labels for entire lesson
      labels = await db.query.questionLabels.findMany({
        where: and(
          eq(questionLabels.lessonId, parseInt(lessonId)),
          isNull(questionLabels.testId)
        ),
        orderBy: (labels, { asc }) => [asc(labels.id)],
      });
    } else {
      // Fetch labels for test
      labels = await db.query.questionLabels.findMany({
        where: and(
          eq(questionLabels.testId, parseInt(testId!)),
          isNull(questionLabels.lessonId)
        ),
        orderBy: (labels, { asc }) => [asc(labels.id)],
      });
    }

    return NextResponse.json({ labels });
  } catch (error: any) {
    console.error("Error fetching labels:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch labels" },
      { status: 500 }
    );
  }
};

// POST - Create a new label
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

    const [newLabel] = await db
      .insert(questionLabels)
      .values({
        challengeId: challengeId ? parseInt(challengeId) : null,
        lessonId: lessonId ? parseInt(lessonId) : null,
        testId: testId ? parseInt(testId) : null,
        text,
        imageSrc: imageSrc || null,
        audioSrc: audioSrc || null,
      })
      .returning();

    return NextResponse.json({ label: newLabel });
  } catch (error: any) {
    console.error("Error creating label:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create label" },
      { status: 500 }
    );
  }
};

