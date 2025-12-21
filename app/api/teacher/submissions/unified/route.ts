import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import {
  writingSubmissions,
  speakingSubmissions,
  testSubmissions,
  users,
  challenges,
  lessons,
  units,
  tests,
  testQuestions,
} from "@/db/schema";
import { eq, and, or, like, desc, sql } from "drizzle-orm";

/**
 * GET /api/teacher/submissions/unified
 * Get unified list of both exercise and test submissions
 */
export async function GET(request: NextRequest) {
  try {
    console.log("=== Unified Submissions API Called ===");

    const { userId } = await auth();

    if (!userId) {
      console.log("No userId - Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("User ID:", userId);

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const type = searchParams.get("type") as "EXERCISE" | "TEST" | null;
    const skillType = searchParams.get("skillType") as "WRITING" | "SPEAKING" | null;
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    console.log("Params:", { page, limit, type, skillType, status, search });

    const offset = (page - 1) * limit;

    let allSubmissions: any[] = [];

    // Fetch exercise submissions (writing + speaking)
    if (!type || type === "EXERCISE") {
      // Writing submissions
      if (!skillType || skillType === "WRITING") {
        // Build where conditions
        const conditions = [];
        if (status) conditions.push(eq(writingSubmissions.status, status as any));
        if (search) {
          conditions.push(
            or(
              like(users.userName, `%${search}%`),
              like(users.email, `%${search}%`)
            )
          );
        }

        const writingData = await db
          .select({
            id: writingSubmissions.id,
            type: sql<string>`'EXERCISE'`,
            skillType: sql<string>`'WRITING'`,
            userId: writingSubmissions.userId,
            studentName: users.userName,
            studentEmail: users.email,
            challengeId: writingSubmissions.challengeId,
            challengeTitle: challenges.question,
            unitTitle: units.title,
            lessonTitle: lessons.title,
            submittedAt: writingSubmissions.submittedAt,
            status: writingSubmissions.status,
            overallBandScore: writingSubmissions.overallBandScore,
            gradedAt: writingSubmissions.gradedAt,
          })
          .from(writingSubmissions)
          .leftJoin(users, eq(writingSubmissions.userId, users.userId))
          .leftJoin(challenges, eq(writingSubmissions.challengeId, challenges.id))
          .leftJoin(lessons, eq(challenges.lessonId, lessons.id))
          .leftJoin(units, eq(lessons.unitId, units.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(writingSubmissions.submittedAt));

        console.log("Writing submissions fetched:", writingData.length);
        allSubmissions.push(...writingData);
      }

      // Speaking submissions
      if (!skillType || skillType === "SPEAKING") {
        // Build where conditions
        const conditions = [];
        if (status) conditions.push(eq(speakingSubmissions.status, status as any));
        if (search) {
          conditions.push(
            or(
              like(users.userName, `%${search}%`),
              like(users.email, `%${search}%`)
            )
          );
        }

        const speakingData = await db
          .select({
            id: speakingSubmissions.id,
            type: sql<string>`'EXERCISE'`,
            skillType: sql<string>`'SPEAKING'`,
            userId: speakingSubmissions.userId,
            studentName: users.userName,
            studentEmail: users.email,
            challengeId: speakingSubmissions.challengeId,
            challengeTitle: challenges.question,
            unitTitle: units.title,
            lessonTitle: lessons.title,
            submittedAt: speakingSubmissions.submittedAt,
            status: speakingSubmissions.status,
            overallBandScore: speakingSubmissions.overallBandScore,
            gradedAt: speakingSubmissions.gradedAt,
          })
          .from(speakingSubmissions)
          .leftJoin(users, eq(speakingSubmissions.userId, users.userId))
          .leftJoin(challenges, eq(speakingSubmissions.challengeId, challenges.id))
          .leftJoin(lessons, eq(challenges.lessonId, lessons.id))
          .leftJoin(units, eq(lessons.unitId, units.id))
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(speakingSubmissions.submittedAt));

        console.log("Speaking submissions fetched:", speakingData.length);
        allSubmissions.push(...speakingData);
      }
    }

    // Fetch test submissions
    if (!type || type === "TEST") {
      // Build where conditions
      const conditions = [];
      if (skillType) conditions.push(eq(testSubmissions.skillType, skillType));
      if (status) conditions.push(eq(testSubmissions.status, status as any));
      if (search) {
        conditions.push(
          or(
            like(users.userName, `%${search}%`),
            like(users.email, `%${search}%`)
          )
        );
      }

      const testData = await db
        .select({
          id: testSubmissions.id,
          type: sql<string>`'TEST'`,
          skillType: testSubmissions.skillType,
          userId: testSubmissions.userId,
          studentName: users.userName,
          studentEmail: users.email,
          testId: testSubmissions.testId,
          attemptId: testSubmissions.attemptId,
          questionId: testSubmissions.questionId,
          testTitle: tests.title,
          questionText: testQuestions.questionText,
          submittedAt: testSubmissions.createdAt,
          status: testSubmissions.status,
          overallBandScore: testSubmissions.overallBandScore,
          gradedAt: testSubmissions.gradedAt,
        })
        .from(testSubmissions)
        .leftJoin(users, eq(testSubmissions.userId, users.userId))
        .leftJoin(tests, eq(testSubmissions.testId, tests.id))
        .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(testSubmissions.createdAt));

      console.log("Test submissions fetched:", testData.length);
      allSubmissions.push(...testData);
    }

    // Remove duplicates from test submissions
    // IMPORTANT: Only deduplicate if SAME attemptId + questionId (same question, different status)
    // DO NOT deduplicate different questions in same test
    const submissionMap = new Map<string, any>();
    const exerciseSubmissions: any[] = [];

    for (const submission of allSubmissions) {
      if (submission.type === "EXERCISE") {
        // Keep all exercise submissions
        exerciseSubmissions.push(submission);
      } else {
        // For test submissions, deduplicate by attemptId + questionId
        // This ensures we keep ALL different questions, but remove duplicate submissions of SAME question
        const key = `${submission.attemptId}_${submission.questionId}`;
        const existing = submissionMap.get(key);

        if (!existing) {
          submissionMap.set(key, submission);
        } else {
          // Priority: GRADED > GRADING > RETURNED > PENDING
          const statusPriority: Record<string, number> = {
            GRADED: 4,
            RETURNED: 3,
            GRADING: 2,
            PENDING: 1,
          };

          const currentPriority = statusPriority[submission.status] || 0;
          const existingPriority = statusPriority[existing.status] || 0;

          if (currentPriority > existingPriority) {
            // Replace with higher priority status
            submissionMap.set(key, submission);
          } else if (currentPriority === existingPriority) {
            // If same priority, keep the latest one
            if (new Date(submission.submittedAt) > new Date(existing.submittedAt)) {
              submissionMap.set(key, submission);
            }
          }
          // Otherwise keep existing (higher priority)
        }
      }
    }

    // Combine exercise and deduplicated test submissions
    const deduplicatedSubmissions = [...exerciseSubmissions, ...Array.from(submissionMap.values())];

    // Sort all submissions by date
    deduplicatedSubmissions.sort((a, b) => {
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    console.log("Total submissions before deduplication:", allSubmissions.length);
    console.log("Total submissions after deduplication:", deduplicatedSubmissions.length);
    console.log("Filters - type:", type, "skillType:", skillType, "status:", status);

    // Paginate
    const total = deduplicatedSubmissions.length;
    const paginatedSubmissions = deduplicatedSubmissions.slice(offset, offset + limit);

    console.log("Paginated submissions:", paginatedSubmissions.length);

    return NextResponse.json({
      submissions: paginatedSubmissions,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching unified submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch submissions" },
      { status: 500 }
    );
  }
}

