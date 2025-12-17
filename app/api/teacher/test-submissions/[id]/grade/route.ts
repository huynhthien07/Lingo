/**
 * API Route: Grade Test Submission
 * POST /api/teacher/test-submissions/[id]/grade
 * 
 * Allows teacher to grade a speaking/writing submission
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { testSubmissions, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Helper function to check if user is teacher
async function getUserRole(userId: string) {
  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.userId, userId))
    .limit(1);
  return user?.role;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is teacher or admin
    const role = await getUserRole(userId);
    if (role !== "TEACHER" && role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const submissionId = parseInt(id);

    if (isNaN(submissionId)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { score, feedback } = body;

    // Validate score
    if (score === undefined || score === null) {
      return NextResponse.json(
        { error: "Score is required" },
        { status: 400 }
      );
    }

    if (score < 0 || score > 9) {
      return NextResponse.json(
        { error: "Score must be between 0 and 9 (IELTS band score)" },
        { status: 400 }
      );
    }

    // Check if submission exists
    const [submission] = await db
      .select()
      .from(testSubmissions)
      .where(eq(testSubmissions.id, submissionId))
      .limit(1);

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    // Update submission with grade
    const [graded] = await db
      .update(testSubmissions)
      .set({
        score,
        feedback: feedback || null,
        status: "GRADED",
        gradedBy: userId,
        gradedAt: new Date(),
      })
      .where(eq(testSubmissions.id, submissionId))
      .returning();

    return NextResponse.json(graded, { status: 200 });
  } catch (error) {
    console.error("❌ Error grading submission:", error);
    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}

