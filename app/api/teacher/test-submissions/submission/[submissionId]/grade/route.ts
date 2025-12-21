import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import db from "@/db/drizzle";
import { testSubmissions } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * PUT /api/teacher/test-submissions/submission/[submissionId]/grade
 * Grade a test submission
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;
    const submissionIdNum = parseInt(submissionId);

    if (isNaN(submissionIdNum)) {
      return NextResponse.json({ error: "Invalid submission ID" }, { status: 400 });
    }

    const body = await request.json();

    // Validate required fields based on skill type
    const {
      fluencyCoherenceScore,
      pronunciationScore,
      taskAchievementScore,
      coherenceCohesionScore,
      lexicalResourceScore,
      grammaticalRangeScore,
      overallBandScore,
      feedback,
      status,
    } = body;

    // Update submission
    const [updated] = await db
      .update(testSubmissions)
      .set({
        fluencyCoherenceScore: fluencyCoherenceScore !== undefined ? fluencyCoherenceScore : null,
        pronunciationScore: pronunciationScore !== undefined ? pronunciationScore : null,
        taskAchievementScore: taskAchievementScore !== undefined ? taskAchievementScore : null,
        coherenceCohesionScore: coherenceCohesionScore !== undefined ? coherenceCohesionScore : null,
        lexicalResourceScore: lexicalResourceScore !== undefined ? lexicalResourceScore : null,
        grammaticalRangeScore: grammaticalRangeScore !== undefined ? grammaticalRangeScore : null,
        overallBandScore,
        feedback,
        status: status || "GRADED",
        gradedBy: userId,
        gradedAt: new Date(),
      })
      .where(eq(testSubmissions.id, submissionIdNum))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Revalidate student learning history page to show updated grade
    revalidatePath("/student/learning-history");
    revalidatePath("/teacher/submissions");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error grading test submission:", error);
    return NextResponse.json(
      { error: "Failed to grade test submission" },
      { status: 500 }
    );
  }
}

