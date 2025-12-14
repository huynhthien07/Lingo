/**
 * Teacher Exercise Management Controller
 * Handles CRUD operations for exercises (challenges)
 */

import db from "@/db/drizzle";
import { challenges, challengeOptions, questions, lessons, units, courses, teacherAssignments } from "@/db/schema";
import { eq, and, desc, asc, ilike, sql, count } from "drizzle-orm";

/**
 * Get paginated list of exercises for a teacher
 */
export const getTeacherExercises = async (
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    lessonId?: number;
    type?: string;
    difficulty?: string;
  } = {}
) => {
  const {
    page = 1,
    limit = 20,
    search = "",
    lessonId,
    type,
    difficulty,
  } = options;

  const offset = (page - 1) * limit;

  // Get all courses assigned to this teacher
  const assignments = await db.query.teacherAssignments.findMany({
    where: eq(teacherAssignments.teacherId, teacherId),
  });

  if (assignments.length === 0) {
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  const courseIds = assignments.map((a) => a.courseId);

  // Build where conditions
  const conditions: any[] = [];

  // Filter by teacher's courses
  conditions.push(sql`${courses.id} IN ${courseIds}`);

  // Filter by specific lesson if provided
  if (lessonId) {
    conditions.push(eq(challenges.lessonId, lessonId));
  }

  // Filter by type if provided
  if (type) {
    conditions.push(eq(challenges.type, type as any));
  }

  // Filter by difficulty if provided
  if (difficulty) {
    conditions.push(eq(challenges.difficulty, difficulty as any));
  }

  // Search filter
  if (search) {
    conditions.push(ilike(challenges.question, `%${search}%`));
  }

  const whereClause = and(...conditions);

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(challenges)
    .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(courses, eq(units.courseId, courses.id))
    .where(whereClause);

  // Get paginated data with option count, lesson title, unit title, and course title
  const data = await db
    .select({
      id: challenges.id,
      question: challenges.question,
      type: challenges.type,
      lessonTitle: lessons.title,
      unitTitle: units.title,
      courseTitle: courses.title,
      difficulty: challenges.difficulty,
      points: challenges.points,
      optionCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${challengeOptions}
        WHERE ${challengeOptions.challengeId} = ${challenges.id}
      )`,
    })
    .from(challenges)
    .innerJoin(lessons, eq(challenges.lessonId, lessons.id))
    .innerJoin(units, eq(lessons.unitId, units.id))
    .innerJoin(courses, eq(units.courseId, courses.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(challenges.id));

  return {
    data,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
};

/**
 * Get single exercise by ID
 */
export const getTeacherExerciseById = async (exerciseId: number, teacherId: string) => {
  const exercise = await db.query.challenges.findFirst({
    where: eq(challenges.id, exerciseId),
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
      challengeOptions: true,
      questions: {
        with: {
          options: true,
        },
        orderBy: (questions, { asc }) => [asc(questions.order)],
      },
    },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, exercise.lesson.unit.course.id),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Exercise not found or you don't have access");
  }

  return exercise;
};

/**
 * Create new exercise
 */
export const createTeacherExercise = async (
  teacherId: string,
  data: any
) => {
  // Get lesson to check course access
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, data.lessonId),
    with: {
      unit: true,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, lesson.unit.courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Lesson not found or you don't have access");
  }

  // Get next order number
  const existingChallenges = await db
    .select({ order: challenges.order })
    .from(challenges)
    .where(eq(challenges.lessonId, data.lessonId))
    .orderBy(desc(challenges.order))
    .limit(1);

  const nextOrder = existingChallenges.length > 0 ? existingChallenges[0].order + 1 : 1;

  // Create exercise
  const [exercise] = await db
    .insert(challenges)
    .values({
      lessonId: data.lessonId,
      type: data.type,
      question: data.question,
      passage: data.passage,
      audioSrc: data.audioSrc,
      imageSrc: data.imageSrc,
      order: data.order !== undefined ? data.order : nextOrder,
      difficulty: data.difficulty || "MEDIUM",
      points: data.points || 10,
      explanation: data.explanation,
    })
    .returning();

  return exercise;
};

/**
 * Update exercise
 */
export const updateTeacherExercise = async (
  exerciseId: number,
  teacherId: string,
  data: any
) => {
  const exercise = await db.query.challenges.findFirst({
    where: eq(challenges.id, exerciseId),
    with: {
      lesson: {
        with: {
          unit: true,
        },
      },
    },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, exercise.lesson.unit.courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Exercise not found or you don't have access");
  }

  // Update exercise
  const [updated] = await db
    .update(challenges)
    .set(data)
    .where(eq(challenges.id, exerciseId))
    .returning();

  return updated;
};

/**
 * Delete exercise
 */
export const deleteTeacherExercise = async (exerciseId: number, teacherId: string) => {
  const exercise = await db.query.challenges.findFirst({
    where: eq(challenges.id, exerciseId),
    with: {
      lesson: {
        with: {
          unit: true,
        },
      },
    },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, exercise.lesson.unit.courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Exercise not found or you don't have access");
  }

  // Delete exercise (cascade will delete options and progress)
  await db.delete(challenges).where(eq(challenges.id, exerciseId));

  return { success: true };
};

/**
 * Create challenge option
 */
export const createChallengeOption = async (
  exerciseId: number,
  teacherId: string,
  data: any
) => {
  // Verify teacher has access to this exercise
  const exercise = await db.query.challenges.findFirst({
    where: eq(challenges.id, exerciseId),
    with: {
      lesson: {
        with: {
          unit: {
            with: {
              course: {
                with: {
                  teacherAssignments: {
                    where: eq(teacherAssignments.teacherId, teacherId),
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!exercise || exercise.lesson.unit.course.teacherAssignments.length === 0) {
    throw new Error("Exercise not found or access denied");
  }

  const [option] = await db
    .insert(challengeOptions)
    .values({
      challengeId: exerciseId,
      text: data.text,
      correct: data.correct || false,
      imageSrc: data.imageSrc || null,
      audioSrc: data.audioSrc || null,
      order: data.order || 0,
    })
    .returning();

  return option;
};

/**
 * Update challenge option
 */
export const updateChallengeOption = async (
  optionId: number,
  teacherId: string,
  data: any
) => {
  // Verify teacher has access
  const option = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, optionId),
    with: {
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: {
                    with: {
                      teacherAssignments: {
                        where: eq(teacherAssignments.teacherId, teacherId),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!option || option.challenge.lesson.unit.course.teacherAssignments.length === 0) {
    throw new Error("Option not found or access denied");
  }

  const updates: any = {};
  if (data.text !== undefined) updates.text = data.text;
  if (data.correct !== undefined) updates.correct = data.correct;
  if (data.imageSrc !== undefined) updates.imageSrc = data.imageSrc;
  if (data.audioSrc !== undefined) updates.audioSrc = data.audioSrc;
  if (data.order !== undefined) updates.order = data.order;

  const [updated] = await db
    .update(challengeOptions)
    .set(updates)
    .where(eq(challengeOptions.id, optionId))
    .returning();

  return updated;
};

/**
 * Delete challenge option
 */
export const deleteChallengeOption = async (optionId: number, teacherId: string) => {
  // Verify teacher has access
  const option = await db.query.challengeOptions.findFirst({
    where: eq(challengeOptions.id, optionId),
    with: {
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: {
                    with: {
                      teacherAssignments: {
                        where: eq(teacherAssignments.teacherId, teacherId),
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!option || option.challenge.lesson.unit.course.teacherAssignments.length === 0) {
    throw new Error("Option not found or access denied");
  }

  await db.delete(challengeOptions).where(eq(challengeOptions.id, optionId));

  return { success: true };
};

