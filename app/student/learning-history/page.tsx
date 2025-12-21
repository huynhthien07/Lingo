import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { writingSubmissions, speakingSubmissions, challenges, testSubmissions, tests, testQuestions, users } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import LearningHistoryClient from "@/components/student/learning-history-client";

// Disable caching to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LearningHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch writing submissions (exercise submissions only) - simplified to avoid nested relation errors
  let writingSubmissionsData: any[] = [];
  try {
    writingSubmissionsData = await db.query.writingSubmissions.findMany({
      where: eq(writingSubmissions.userId, userId),
      orderBy: [desc(writingSubmissions.submittedAt)],
      with: {
        challenge: true,
      },
    });
  } catch (error) {
    console.error("Error fetching writing submissions:", error);
  }

  // Fetch speaking submissions (exercise submissions only) - simplified to avoid nested relation errors
  let speakingSubmissionsData: any[] = [];
  try {
    speakingSubmissionsData = await db.query.speakingSubmissions.findMany({
      where: eq(speakingSubmissions.userId, userId),
      orderBy: [desc(speakingSubmissions.submittedAt)],
      with: {
        challenge: true,
      },
    });
  } catch (error) {
    console.error("Error fetching speaking submissions:", error);
  }

  // Fetch test submissions (speaking/writing tests)
  let testSubmissionsData: any[] = [];
  try {
    console.log("=== Fetching test submissions for userId:", userId);

    const allTestSubmissions = await db
      .select({
        id: testSubmissions.id,
        attemptId: testSubmissions.attemptId,
        testId: testSubmissions.testId,
        questionId: testSubmissions.questionId,
        skillType: testSubmissions.skillType,
        audioUrl: testSubmissions.audioUrl,
        textAnswer: testSubmissions.textAnswer,
        score: testSubmissions.score,
        maxScore: testSubmissions.maxScore,
        // Criteria scores
        fluencyCoherenceScore: testSubmissions.fluencyCoherenceScore,
        pronunciationScore: testSubmissions.pronunciationScore,
        taskAchievementScore: testSubmissions.taskAchievementScore,
        coherenceCohesionScore: testSubmissions.coherenceCohesionScore,
        lexicalResourceScore: testSubmissions.lexicalResourceScore,
        grammaticalRangeScore: testSubmissions.grammaticalRangeScore,
        overallBandScore: testSubmissions.overallBandScore,
        feedback: testSubmissions.feedback,
        status: testSubmissions.status,
        gradedAt: testSubmissions.gradedAt,
        createdAt: testSubmissions.createdAt,
        testTitle: tests.title,
        questionText: testQuestions.questionText,
        graderName: users.userName,
      })
      .from(testSubmissions)
      .leftJoin(tests, eq(testSubmissions.testId, tests.id))
      .leftJoin(testQuestions, eq(testSubmissions.questionId, testQuestions.id))
      .leftJoin(users, eq(testSubmissions.gradedBy, users.userId))
      .where(eq(testSubmissions.userId, userId))
      .orderBy(desc(testSubmissions.createdAt));

    console.log("All test submissions fetched:", allTestSubmissions.length);

    // Remove duplicates - keep only the latest submission for each attemptId + questionId
    // Priority: GRADED > PENDING (if same attemptId + questionId, keep GRADED one)
    const submissionMap = new Map<string, any>();

    for (const submission of allTestSubmissions) {
      const key = `${submission.attemptId}_${submission.questionId}`;
      const existing = submissionMap.get(key);

      if (!existing) {
        submissionMap.set(key, submission);
      } else {
        // Keep GRADED over PENDING
        if (submission.status === "GRADED" && existing.status === "PENDING") {
          submissionMap.set(key, submission);
        } else if (submission.status === existing.status) {
          // If same status, keep the latest one
          if (new Date(submission.createdAt) > new Date(existing.createdAt)) {
            submissionMap.set(key, submission);
          }
        }
      }
    }

    testSubmissionsData = Array.from(submissionMap.values());

    console.log("After deduplication:", testSubmissionsData.length);
    console.log("Sample data:", testSubmissionsData[0]);
  } catch (error) {
    console.error("Error fetching test submissions:", error);
  }

  return (
    <LearningHistoryClient
      writingSubmissions={writingSubmissionsData}
      speakingSubmissions={speakingSubmissionsData}
      testSubmissions={testSubmissionsData}
    />
  );
}

