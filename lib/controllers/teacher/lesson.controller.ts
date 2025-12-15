/**
 * Teacher Lesson Management Controller
 * Handles CRUD operations for lessons within units
 */

import db from "@/db/drizzle";
import { lessons, units, courses, teacherAssignments, challenges, users } from "@/db/schema";
import { eq, and, desc, asc, ilike, sql, count } from "drizzle-orm";

/**
 * Check if user is admin
 */
async function isUserAdmin(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
  return user?.role === "ADMIN";
}

/**
 * Get paginated list of lessons for a teacher (all courses or specific unit)
 */
export const getTeacherLessons = async (
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    unitId?: number;
    skillType?: string;
    unassigned?: boolean;
  } = {}
) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    unitId,
    skillType,
    unassigned = false,
  } = options;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions: any[] = [];

  // If unassigned=true, get lessons without unitId
  if (unassigned) {
    conditions.push(sql`${lessons.unitId} IS NULL`);
  } else {
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

    // Filter by teacher's courses (via units)
    conditions.push(sql`${units.courseId} IN ${courseIds}`);

    // Filter by specific unit if provided
    if (unitId) {
      conditions.push(eq(lessons.unitId, unitId));
    }
  }

  // Filter by skill type if provided
  if (skillType) {
    conditions.push(eq(lessons.skillType, skillType as any));
  }

  // Search filter
  if (search) {
    conditions.push(ilike(lessons.title, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  let total = 0;
  if (unassigned) {
    const [result] = await db
      .select({ total: count() })
      .from(lessons)
      .where(whereClause);
    total = Number(result.total);
  } else {
    const [result] = await db
      .select({ total: count() })
      .from(lessons)
      .innerJoin(units, eq(lessons.unitId, units.id))
      .where(whereClause);
    total = Number(result.total);
  }

  // Get paginated data
  let data;
  if (unassigned) {
    // For unassigned lessons, don't join with units/courses
    data = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        unitId: lessons.unitId,
        unitTitle: sql<string>`NULL`,
        courseTitle: sql<string>`NULL`,
        order: lessons.order,
        skillType: lessons.skillType,
        estimatedDuration: lessons.estimatedDuration,
        exerciseCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${challenges}
          WHERE ${challenges.lessonId} = ${lessons.id}
        )`,
      })
      .from(lessons)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(lessons.order));
  } else {
    // For assigned lessons, join with units and courses
    data = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        unitId: lessons.unitId,
        unitTitle: units.title,
        courseTitle: courses.title,
        order: lessons.order,
        skillType: lessons.skillType,
        estimatedDuration: lessons.estimatedDuration,
        exerciseCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM ${challenges}
          WHERE ${challenges.lessonId} = ${lessons.id}
        )`,
      })
      .from(lessons)
      .innerJoin(units, eq(lessons.unitId, units.id))
      .innerJoin(courses, eq(units.courseId, courses.id))
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(asc(lessons.order));
  }

  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get single lesson by ID
 */
export const getTeacherLessonById = async (lessonId: number, teacherId: string) => {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: {
        with: {
          course: true,
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Check if user is admin or teacher assigned to this course
  const isAdmin = await isUserAdmin(teacherId);

  if (!isAdmin) {
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, lesson.unit.courseId),
        eq(teacherAssignments.teacherId, teacherId)
      ),
    });

    if (!assignment) {
      throw new Error("Lesson not found or you don't have access");
    }
  }

  // Get exercise count
  const [{ exerciseCount }] = await db
    .select({ exerciseCount: count() })
    .from(challenges)
    .where(eq(challenges.lessonId, lessonId));

  return {
    ...lesson,
    exerciseCount: Number(exerciseCount),
  };
};

/**
 * Create new lesson
 */
export const createTeacherLesson = async (
  teacherId: string,
  data: any
) => {
  // Get unit to check course access
  const unit = await db.query.units.findFirst({
    where: eq(units.id, data.unitId),
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  // Check if user is admin or teacher assigned to this course
  const isAdmin = await isUserAdmin(teacherId);

  if (!isAdmin) {
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, unit.courseId),
        eq(teacherAssignments.teacherId, teacherId)
      ),
    });

    if (!assignment) {
      throw new Error("Unit not found or you don't have access");
    }
  }

  // Get next order number
  const existingLessons = await db
    .select({ order: lessons.order })
    .from(lessons)
    .where(eq(lessons.unitId, data.unitId))
    .orderBy(desc(lessons.order))
    .limit(1);

  const nextOrder = existingLessons.length > 0 ? existingLessons[0].order + 1 : 1;

  // Create lesson
  const [lesson] = await db
    .insert(lessons)
    .values({
      title: data.title,
      description: data.description,
      unitId: data.unitId,
      order: data.order !== undefined ? data.order : nextOrder,
      skillType: data.skillType,
      estimatedDuration: data.estimatedDuration,
    })
    .returning();

  return lesson;
};

/**
 * Update lesson
 */
export const updateTeacherLesson = async (
  lessonId: number,
  teacherId: string,
  data: any
) => {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: true,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Check if user is admin or teacher assigned to this course
  const isAdmin = await isUserAdmin(teacherId);

  if (!isAdmin) {
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, lesson.unit.courseId),
        eq(teacherAssignments.teacherId, teacherId)
      ),
    });

    if (!assignment) {
      throw new Error("Lesson not found or you don't have access");
    }
  }

  // Prepare update data - handle empty strings
  const updateData: any = { ...data };

  // Convert empty strings to null for optional fields
  if (updateData.videoUrl === "") {
    updateData.videoUrl = null;
  }
  if (updateData.description === "") {
    updateData.description = null;
  }

  // Update lesson
  await db
    .update(lessons)
    .set(updateData)
    .where(eq(lessons.id, lessonId));

  // Fetch and return the updated lesson with full relations
  const updatedLesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: {
        with: {
          course: true,
        },
      },
    },
  });

  return updatedLesson;
};

/**
 * Delete lesson
 */
export const deleteTeacherLesson = async (lessonId: number, teacherId: string) => {
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonId),
    with: {
      unit: true,
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  // Check if user is admin or teacher assigned to this course
  const isAdmin = await isUserAdmin(teacherId);

  if (!isAdmin) {
    const assignment = await db.query.teacherAssignments.findFirst({
      where: and(
        eq(teacherAssignments.courseId, lesson.unit.courseId),
        eq(teacherAssignments.teacherId, teacherId)
      ),
    });

    if (!assignment) {
      throw new Error("Lesson not found or you don't have access");
    }
  }

  // Delete lesson (cascade will delete challenges)
  await db.delete(lessons).where(eq(lessons.id, lessonId));

  return { success: true };
};

