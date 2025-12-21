/**
 * API Route: Grade Test Submission
 * POST /api/teacher/test-submissions/[submissionId]/grade - Grade submission with criteria scores
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
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
  context: { params: Promise<{ submissionId: string }> }
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

    const { submissionId } = await context.params;
    const submissionIdNum = parseInt(submissionId);

    if (isNaN(submissionIdNum)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.feedback || body.feedback.length < 20) {
      return NextResponse.json(
        { error: "Feedback must be at least 20 characters" },
        { status: 400 }
      );
    }

    // Calculate overall band score from criteria scores
    const scores: number[] = [];
    
    if (body.fluencyCoherenceScore !== null && body.fluencyCoherenceScore !== undefined) {
      scores.push(body.fluencyCoherenceScore);
    }
    if (body.pronunciationScore !== null && body.pronunciationScore !== undefined) {
      scores.push(body.pronunciationScore);
    }
    if (body.taskAchievementScore !== null && body.taskAchievementScore !== undefined) {
      scores.push(body.taskAchievementScore);
    }
    if (body.coherenceCohesionScore !== null && body.coherenceCohesionScore !== undefined) {
      scores.push(body.coherenceCohesionScore);
    }
    if (body.lexicalResourceScore !== null && body.lexicalResourceScore !== undefined) {
      scores.push(body.lexicalResourceScore);
    }
    if (body.grammaticalRangeScore !== null && body.grammaticalRangeScore !== undefined) {
      scores.push(body.grammaticalRangeScore);
    }

    if (scores.length === 0) {
      return NextResponse.json(
        { error: "At least one criteria score is required" },
        { status: 400 }
      );
    }

    const overallBandScore = scores.reduce((a, b) => a + b, 0) / scores.length;

    // Update submission
    const [updatedSubmission] = await db
      .update(testSubmissions)
      .set({
        fluencyCoherenceScore: body.fluencyCoherenceScore || null,
        pronunciationScore: body.pronunciationScore || null,
        taskAchievementScore: body.taskAchievementScore || null,
        coherenceCohesionScore: body.coherenceCohesionScore || null,
        lexicalResourceScore: body.lexicalResourceScore || null,
        grammaticalRangeScore: body.grammaticalRangeScore || null,
        overallBandScore,
        score: Math.round(overallBandScore), // For backward compatibility
        feedback: body.feedback,
        status: "GRADED",
        gradedBy: userId,
        gradedAt: new Date(),
      })
      .where(eq(testSubmissions.id, submissionIdNum))
      .returning();

    if (!updatedSubmission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Revalidate student learning history page to show updated grade
    revalidatePath("/student/learning-history");
    revalidatePath("/teacher/submissions");

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
    });
  } catch (error) {
    console.error("❌ Error grading submission:", error);
    return NextResponse.json(
      { error: "Failed to grade submission" },
      { status: 500 }
    );
  }
}

