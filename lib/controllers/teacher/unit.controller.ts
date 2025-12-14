/**
 * Teacher Unit Management Controller
 * Handles CRUD operations for units within courses
 */

import db from "@/db/drizzle";
import { units, courses, teacherAssignments, lessons } from "@/db/schema";
import { eq, and, desc, asc, ilike, sql, count } from "drizzle-orm";

/**
 * Get paginated list of units for a teacher (all courses or specific course)
 */
export const getTeacherUnits = async (
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    courseId?: number;
    unassigned?: boolean;
  } = {}
) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "order",
    sortOrder = "asc",
    courseId,
    unassigned = false,
  } = options;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions: any[] = [];

  // If unassigned=true, get units without courseId
  if (unassigned) {
    conditions.push(sql`${units.courseId} IS NULL`);
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
    conditions.push(sql`${units.courseId} IN ${courseIds}`);

    // Filter by specific course if provided
    if (courseId) {
      conditions.push(eq(units.courseId, courseId));
    }
  }

  // Search filter
  if (search) {
    conditions.push(ilike(units.title, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(units)
    .where(whereClause);

  // Get paginated data with lesson count and course title
  const data = await db
    .select({
      id: units.id,
      title: units.title,
      description: units.description,
      courseId: units.courseId,
      courseTitle: courses.title,
      order: units.order,
      lessonCount: sql<number>`(
        SELECT COUNT(*)::int
        FROM ${lessons}
        WHERE ${lessons.unitId} = ${units.id}
      )`,
    })
    .from(units)
    .innerJoin(courses, eq(units.courseId, courses.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(asc(units.order));

  return {
    data,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
};

/**
 * Get single unit by ID
 */
export const getTeacherUnitById = async (unitId: number, teacherId: string) => {
  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
    with: {
      course: true,
    },
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, unit.courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Unit not found or you don't have access");
  }

  // Get lesson count
  const [{ lessonCount }] = await db
    .select({ lessonCount: count() })
    .from(lessons)
    .where(eq(lessons.unitId, unitId));

  return {
    ...unit,
    lessonCount: Number(lessonCount),
  };
};

/**
 * Create new unit
 */
export const createTeacherUnit = async (
  teacherId: string,
  data: any
) => {
  const { courseId, title, description, order } = data;

  // courseId is required
  if (!courseId) {
    throw new Error("Course ID is required");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Course not found or you don't have access");
  }

  // Get next order number
  const existingUnits = await db
    .select({ order: units.order })
    .from(units)
    .where(eq(units.courseId, courseId))
    .orderBy(desc(units.order))
    .limit(1);

  const nextOrder = existingUnits.length > 0 ? existingUnits[0].order + 1 : 1;

  // Create unit
  const [unit] = await db
    .insert(units)
    .values({
      title,
      description,
      courseId,
      order: order !== undefined ? order : nextOrder,
    })
    .returning();

  return unit;
};

/**
 * Update unit
 */
export const updateTeacherUnit = async (
  unitId: number,
  teacherId: string,
  data: any
) => {
  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, unit.courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Unit not found or you don't have access");
  }

  // Update unit
  const [updated] = await db
    .update(units)
    .set(data)
    .where(eq(units.id, unitId))
    .returning();

  return updated;
};

/**
 * Delete unit
 */
export const deleteTeacherUnit = async (unitId: number, teacherId: string) => {
  const unit = await db.query.units.findFirst({
    where: eq(units.id, unitId),
  });

  if (!unit) {
    throw new Error("Unit not found");
  }

  // Check if teacher is assigned to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.courseId, unit.courseId),
      eq(teacherAssignments.teacherId, teacherId)
    ),
  });

  if (!assignment) {
    throw new Error("Unit not found or you don't have access");
  }

  // Delete unit (cascade will delete lessons and challenges)
  await db.delete(units).where(eq(units.id, unitId));

  return { success: true };
};

