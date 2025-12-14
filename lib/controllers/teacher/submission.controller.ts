import db from "@/db/drizzle";
import {
  writingSubmissions,
  speakingSubmissions,
  users,
  challenges,
  lessons,
  units,
  courses,
  teacherAssignments,
} from "@/db/schema";
import { eq, and, desc, or, ilike, sql } from "drizzle-orm";

// Get writing submissions for teacher's courses
export async function getTeacherWritingSubmissions(
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) {
  const { page = 1, limit = 20, status, search } = options;
  const offset = (page - 1) * limit;

  // Get teacher's assigned courses
  const assignments = await db.query.teacherAssignments.findMany({
    where: eq(teacherAssignments.teacherId, teacherId),
  });

  const courseIds = assignments.map((a) => a.courseId);

  if (courseIds.length === 0) {
    return { submissions: [], total: 0, page, limit };
  }

  // Build where conditions
  const conditions = [];

  if (status) {
    conditions.push(eq(writingSubmissions.status, status as any));
  }

  // Get submissions with relations
  const submissionsData = await db.query.writingSubmissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      user: true,
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
    },
    orderBy: [desc(writingSubmissions.submittedAt)],
    limit,
    offset,
  });

  // Filter by course IDs and search
  let filteredSubmissions = submissionsData.filter((s) =>
    courseIds.includes(s.challenge.lesson.unit.course.id)
  );

  if (search) {
    const searchLower = search.toLowerCase();
    filteredSubmissions = filteredSubmissions.filter(
      (s) =>
        s.user.userName?.toLowerCase().includes(searchLower) ||
        s.user.email.toLowerCase().includes(searchLower) ||
        s.challenge.question.toLowerCase().includes(searchLower)
    );
  }

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(writingSubmissions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(totalResult[0]?.count || 0);

  return {
    submissions: filteredSubmissions,
    total,
    page,
    limit,
  };
}

// Get speaking submissions for teacher's courses
export async function getTeacherSpeakingSubmissions(
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  } = {}
) {
  const { page = 1, limit = 20, status, search } = options;
  const offset = (page - 1) * limit;

  // Get teacher's assigned courses
  const assignments = await db.query.teacherAssignments.findMany({
    where: eq(teacherAssignments.teacherId, teacherId),
  });

  const courseIds = assignments.map((a) => a.courseId);

  if (courseIds.length === 0) {
    return { submissions: [], total: 0, page, limit };
  }

  // Build where conditions
  const conditions = [];

  if (status) {
    conditions.push(eq(speakingSubmissions.status, status as any));
  }

  // Get submissions with relations
  const submissionsData = await db.query.speakingSubmissions.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      user: true,
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
    },
    orderBy: [desc(speakingSubmissions.submittedAt)],
    limit,
    offset,
  });

  // Filter by course IDs and search
  let filteredSubmissions = submissionsData.filter((s) =>
    courseIds.includes(s.challenge.lesson.unit.course.id)
  );

  if (search) {
    const searchLower = search.toLowerCase();
    filteredSubmissions = filteredSubmissions.filter(
      (s) =>
        s.user.userName?.toLowerCase().includes(searchLower) ||
        s.user.email.toLowerCase().includes(searchLower) ||
        s.challenge.question.toLowerCase().includes(searchLower)
    );
  }

  // Get total count
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(speakingSubmissions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const total = Number(totalResult[0]?.count || 0);

  return {
    submissions: filteredSubmissions,
    total,
    page,
    limit,
  };
}

// Get writing submission detail
export async function getWritingSubmissionDetail(submissionId: number) {
  const submission = await db.query.writingSubmissions.findFirst({
    where: eq(writingSubmissions.id, submissionId),
    with: {
      user: true,
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
      feedback: {
        with: {
          createdByUser: true,
        },
      },
    },
  });

  return submission;
}

// Get speaking submission detail
export async function getSpeakingSubmissionDetail(submissionId: number) {
  const submission = await db.query.speakingSubmissions.findFirst({
    where: eq(speakingSubmissions.id, submissionId),
    with: {
      user: true,
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
      feedback: {
        with: {
          createdByUser: true,
        },
      },
    },
  });

  return submission;
}

// Grade writing submission
export async function gradeWritingSubmission(
  submissionId: number,
  teacherId: string,
  data: {
    taskAchievementScore: number;
    coherenceCohesionScore: number;
    lexicalResourceScore: number;
    grammaticalRangeScore: number;
    teacherFeedback: string;
  }
) {
  const overallBandScore =
    (data.taskAchievementScore +
      data.coherenceCohesionScore +
      data.lexicalResourceScore +
      data.grammaticalRangeScore) /
    4;

  await db
    .update(writingSubmissions)
    .set({
      taskAchievementScore: data.taskAchievementScore,
      coherenceCohesionScore: data.coherenceCohesionScore,
      lexicalResourceScore: data.lexicalResourceScore,
      grammaticalRangeScore: data.grammaticalRangeScore,
      overallBandScore,
      teacherFeedback: data.teacherFeedback,
      teacherId,
      status: "GRADED",
      gradedAt: new Date(),
    })
    .where(eq(writingSubmissions.id, submissionId));

  return { success: true };
}

// Grade speaking submission
export async function gradeSpeakingSubmission(
  submissionId: number,
  teacherId: string,
  data: {
    fluencyCoherenceScore: number;
    lexicalResourceScore: number;
    grammaticalRangeScore: number;
    pronunciationScore: number;
    teacherFeedback: string;
  }
) {
  const overallBandScore =
    (data.fluencyCoherenceScore +
      data.lexicalResourceScore +
      data.grammaticalRangeScore +
      data.pronunciationScore) /
    4;

  await db
    .update(speakingSubmissions)
    .set({
      fluencyCoherenceScore: data.fluencyCoherenceScore,
      lexicalResourceScore: data.lexicalResourceScore,
      grammaticalRangeScore: data.grammaticalRangeScore,
      pronunciationScore: data.pronunciationScore,
      overallBandScore,
      teacherFeedback: data.teacherFeedback,
      teacherId,
      status: "GRADED",
      gradedAt: new Date(),
    })
    .where(eq(speakingSubmissions.id, submissionId));

  return { success: true };
}

