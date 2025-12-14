import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  getWritingSubmissionDetail,
  gradeWritingSubmission,
} from "@/lib/controllers/teacher/submission.controller";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { submissionId } = await params;
    const submission = await getWritingSubmissionDetail(parseInt(submissionId));

    if (!submission) {
      return NextResponse.json(
        { error: "Submission not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error("Error fetching writing submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch writing submission" },
      { status: 500 }
    );
  }
}

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
    const body = await request.json();

    const result = await gradeWritingSubmission(
      parseInt(submissionId),
      userId,
      body
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error grading writing submission:", error);
    return NextResponse.json(
      { error: "Failed to grade writing submission" },
      { status: 500 }
    );
  }
}

