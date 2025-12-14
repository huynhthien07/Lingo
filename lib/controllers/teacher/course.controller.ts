/**
 * Teacher Course Management Controller
 * Handles CRUD operations for courses created by teachers
 */

import db from "@/db/drizzle";
import { courses, teacherAssignments, courseEnrollments, users, units, lessons } from "@/db/schema";
import { eq, and, desc, asc, ilike, or, sql, count } from "drizzle-orm";

/**
 * Get paginated list of courses for a teacher
 */
export const getTeacherCourses = async (
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    examType?: string;
    level?: string;
  } = {}
) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sortBy = "createdAt",
    sortOrder = "desc",
    examType,
    level,
  } = options;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions: any[] = [];

  // Filter by course creator (teacher who created the course)
  conditions.push(eq(courses.createdBy, teacherId));

  // Search filter
  if (search) {
    conditions.push(
      or(
        ilike(courses.title, `%${search}%`),
        ilike(courses.description, `%${search}%`)
      )
    );
  }

  // Exam type filter
  if (examType) {
    conditions.push(eq(courses.examType, examType as any));
  }

  // Level filter
  if (level) {
    conditions.push(eq(courses.level, level as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const [{ total }] = await db
    .select({ total: count() })
    .from(courses)
    .where(whereClause);

  // Get paginated data with counts
  const data = await db
    .select({
      id: courses.id,
      title: courses.title,
      imageSrc: courses.imageSrc,
      description: courses.description,
      examType: courses.examType,
      level: courses.level,
      price: courses.price,
      currency: courses.currency,
      isFree: courses.isFree,
      createdBy: courses.createdBy,
      createdAt: courses.createdAt,
      updatedAt: courses.updatedAt,
    })
    .from(courses)
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(courses.createdAt));

  // Get student count and lesson count for each course
  const enrichedData = await Promise.all(
    data.map(async (course) => {
      // Get student count
      const [{ count: studentCount }] = await db
        .select({ count: count() })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, course.id));

      // Get lesson count (count lessons through units)
      const [{ count: lessonCount }] = await db
        .select({ count: count() })
        .from(lessons)
        .innerJoin(units, eq(lessons.unitId, units.id))
        .where(eq(units.courseId, course.id));

      return {
        ...course,
        studentCount: Number(studentCount),
        lessonCount: Number(lessonCount),
      };
    })
  );

  return {
    data: enrichedData,
    total: Number(total),
    page,
    limit,
    totalPages: Math.ceil(Number(total) / limit),
  };
};

/**
 * Get single course by ID (teacher must be assigned)
 */
export const getTeacherCourseById = async (courseId: number, teacherId: string) => {
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

  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Get enrollment count
  const [{ enrollmentCount }] = await db
    .select({ enrollmentCount: count() })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.courseId, courseId));

  return {
    ...course,
    enrollmentCount: Number(enrollmentCount),
  };
};

/**
 * Create new course
 */
export const createTeacherCourse = async (teacherId: string, data: any) => {
  // Create course
  const [course] = await db
    .insert(courses)
    .values({
      title: data.title,
      imageSrc: data.imageSrc || "/course-placeholder.svg",
      description: data.description,
      examType: data.examType || "IELTS",
      level: data.level || "INTERMEDIATE",
      price: data.price || 0,
      currency: data.currency || "USD",
      isFree: data.isFree || false,
      createdBy: teacherId, // Set the creator
    })
    .returning();

  // Assign teacher to course (for backward compatibility with teacherAssignments)
  await db.insert(teacherAssignments).values({
    teacherId,
    courseId: course.id,
  });

  return course;
};

/**
 * Update course
 */
export const updateTeacherCourse = async (
  courseId: number,
  teacherId: string,
  data: any
) => {
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

  // Update course
  const [updated] = await db
    .update(courses)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(courses.id, courseId))
    .returning();

  return updated;
};

/**
 * Delete course
 */
export const deleteTeacherCourse = async (courseId: number, teacherId: string) => {
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

  // Check if course has enrollments
  const [{ enrollmentCount }] = await db
    .select({ enrollmentCount: count() })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.courseId, courseId));

  if (Number(enrollmentCount) > 0) {
    throw new Error("Cannot delete course with active enrollments");
  }

  // Delete course (cascade will delete units, lessons, challenges, etc.)
  await db.delete(courses).where(eq(courses.id, courseId));

  return { success: true };
};

