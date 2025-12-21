import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { writingSubmissions, speakingSubmissions, testSubmissions } from "@/db/schema";
import { sql } from "drizzle-orm";

/**
 * GET /api/teacher/submissions/test-data
 * Test endpoint to check if there's data in the database
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count writing submissions
    const [writingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(writingSubmissions);

    // Count speaking submissions
    const [speakingCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(speakingSubmissions);

    // Count test submissions
    const [testCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(testSubmissions);

    // Get sample writing submissions
    const sampleWriting = await db
      .select()
      .from(writingSubmissions)
      .limit(3);

    // Get sample speaking submissions
    const sampleSpeaking = await db
      .select()
      .from(speakingSubmissions)
      .limit(3);

    // Get sample test submissions
    const sampleTest = await db
      .select()
      .from(testSubmissions)
      .limit(3);

    return NextResponse.json({
      counts: {
        writing: Number(writingCount.count),
        speaking: Number(speakingCount.count),
        test: Number(testCount.count),
        total: Number(writingCount.count) + Number(speakingCount.count) + Number(testCount.count),
      },
      samples: {
        writing: sampleWriting,
        speaking: sampleSpeaking,
        test: sampleTest,
      },
    });
  } catch (error) {
    console.error("Error in test-data endpoint:", error);
    return NextResponse.json(
      { error: "Failed to fetch test data", details: String(error) },
      { status: 500 }
    );
  }
}

