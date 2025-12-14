import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { challenges, lessons, courses, questions } from "@/db/schema";
import { eq, sql, ilike, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const skillType = searchParams.get("skillType");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Build query conditions
    const conditions = [];
    
    // Filter by skill type if provided
    if (skillType) {
      // Map skill type to challenge types
      const skillTypeMap: Record<string, string[]> = {
        LISTENING: [
          "LISTENING_MULTIPLE_CHOICE",
          "LISTENING_FORM_COMPLETION",
          "LISTENING_MAP_LABELLING",
          "LISTENING_SHORT_ANSWER",
        ],
        READING: [
          "READING_MULTIPLE_CHOICE",
          "READING_TRUE_FALSE_NOT_GIVEN",
          "READING_MATCHING_HEADINGS",
          "READING_SENTENCE_COMPLETION",
          "READING_SUMMARY_COMPLETION",
        ],
        WRITING: ["WRITING_TASK_1", "WRITING_TASK_2"],
        SPEAKING: ["SPEAKING_PART_1", "SPEAKING_PART_2", "SPEAKING_PART_3"],
        VOCABULARY: ["VOCABULARY"],
        GRAMMAR: ["GRAMMAR"],
      };

      const types = skillTypeMap[skillType] || [];
      if (types.length > 0) {
        conditions.push(
          sql`${challenges.type} IN (${sql.join(
            types.map((t) => sql`${t}`),
            sql`, `
          )})`
        );
      }
    }

    // Search by question text
    if (search) {
      conditions.push(ilike(challenges.question, `%${search}%`));
    }

    // Fetch challenges with lesson and course info
    const challengesList = await db
      .select({
        id: challenges.id,
        type: challenges.type,
        question: challenges.question,
        difficulty: challenges.difficulty,
        points: challenges.points,
        passage: challenges.passage,
        audioSrc: challenges.audioSrc,
        imageSrc: challenges.imageSrc,
        lessonId: challenges.lessonId,
        lessonTitle: lessons.title,
        courseTitle: courses.title,
      })
      .from(challenges)
      .leftJoin(lessons, eq(challenges.lessonId, lessons.id))
      .leftJoin(courses, eq(lessons.courseId, courses.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .limit(limit)
      .orderBy(challenges.id);

    // Get question counts for each challenge
    const challengeIds = challengesList.map((c) => c.id);
    const questionCounts = await db
      .select({
        challengeId: questions.challengeId,
        count: sql<number>`count(*)::int`,
      })
      .from(questions)
      .where(sql`${questions.challengeId} IN (${sql.join(challengeIds.map((id) => sql`${id}`), sql`, `)})`)
      .groupBy(questions.challengeId);

    const questionCountMap = Object.fromEntries(
      questionCounts.map((qc) => [qc.challengeId, qc.count])
    );

    // Format response
    const formattedChallenges = challengesList.map((challenge) => ({
      ...challenge,
      hasQuestions: (questionCountMap[challenge.id] || 0) > 0,
      questionCount: questionCountMap[challenge.id] || 0,
    }));

    return NextResponse.json({
      challenges: formattedChallenges,
      total: formattedChallenges.length,
    });
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenges" },
      { status: 500 }
    );
  }
}

