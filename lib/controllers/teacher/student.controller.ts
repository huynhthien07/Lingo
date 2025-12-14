/**
 * Teacher Student Management Controller
 * Handles student management for teachers - view students enrolled in their courses
 */

import db from "@/db/drizzle";
import { 
  users, 
  courseEnrollments, 
  courses, 
  teacherAssignments,
  lessonProgress,
  challengeProgress,
  lessons,
  units
} from "@/db/schema";
import { eq, and, desc, asc, ilike, sql, count, inArray } from "drizzle-orm";

/**
 * Get paginated list of students enrolled in teacher's courses
 */
export const getTeacherStudents = async (
  teacherId: string,
  options: {
    page?: number;
    limit?: number;
    search?: string;
    courseId?: number;
    status?: string;
  } = {}
) => {
  const { page = 1, limit = 20, search = "", courseId, status } = options;
  const offset = (page - 1) * limit;

  // Get courses assigned to this teacher
  const teacherCourses = await db.query.teacherAssignments.findMany({
    where: eq(teacherAssignments.teacherId, teacherId),
    columns: { courseId: true },
  });

  const courseIds = teacherCourses.map((tc) => tc.courseId);

  if (courseIds.length === 0) {
    return {
      students: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  // Build where conditions
  const conditions = [inArray(courseEnrollments.courseId, courseIds)];

  if (courseId) {
    conditions.push(eq(courseEnrollments.courseId, courseId));
  }

  if (status) {
    conditions.push(eq(courseEnrollments.status, status as any));
  }

  // Get enrollments with user and course data
  const enrollments = await db.query.courseEnrollments.findMany({
    where: and(...conditions),
    with: {
      user: true,
      course: true,
    },
    orderBy: [desc(courseEnrollments.enrolledAt)],
    limit,
    offset,
  });

  // Filter by search if provided
  let filteredEnrollments = enrollments;
  if (search) {
    filteredEnrollments = enrollments.filter((enrollment) =>
      enrollment.user.userName.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.user.email.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Get total count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(courseEnrollments)
    .where(and(...conditions));

  return {
    students: filteredEnrollments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Get student detail with progress
 */
export const getTeacherStudentDetail = async (
  teacherId: string,
  studentId: string,
  courseId: number
) => {
  // Verify teacher has access to this course
  const assignment = await db.query.teacherAssignments.findFirst({
    where: and(
      eq(teacherAssignments.teacherId, teacherId),
      eq(teacherAssignments.courseId, courseId)
    ),
  });

  if (!assignment) {
    throw new Error("You don't have access to this course");
  }

  // Get enrollment
  const enrollment = await db.query.courseEnrollments.findFirst({
    where: and(
      eq(courseEnrollments.userId, studentId),
      eq(courseEnrollments.courseId, courseId)
    ),
    with: {
      user: true,
      course: {
        with: {
          units: {
            with: {
              lessons: true,
            },
            orderBy: [asc(units.order)],
          },
        },
      },
    },
  });

  if (!enrollment) {
    throw new Error("Student not found in this course");
  }

  // Get lesson progress
  const lessonIds = enrollment.course.units.flatMap((unit) =>
    unit.lessons.map((lesson) => lesson.id)
  );

  const lessonProgressData = await db.query.lessonProgress.findMany({
    where: and(
      eq(lessonProgress.userId, studentId),
      inArray(lessonProgress.lessonId, lessonIds)
    ),
  });

  // Get challenge progress for detailed stats
  const challengeProgressData = await db.query.challengeProgress.findMany({
    where: eq(challengeProgress.userId, studentId),
    with: {
      challenge: {
        with: {
          lesson: true,
        },
      },
    },
  });

  // Calculate skill-based progress
  const skillProgress = {
    LISTENING: { completed: 0, total: 0 },
    READING: { completed: 0, total: 0 },
    WRITING: { completed: 0, total: 0 },
    SPEAKING: { completed: 0, total: 0 },
    VOCABULARY: { completed: 0, total: 0 },
    GRAMMAR: { completed: 0, total: 0 },
  };

  // Count lessons by skill type
  enrollment.course.units.forEach((unit) => {
    unit.lessons.forEach((lesson) => {
      const skillType = lesson.skillType as keyof typeof skillProgress;
      if (skillProgress[skillType]) {
        skillProgress[skillType].total++;
        if (lessonProgressData.some((lp) => lp.lessonId === lesson.id && lp.completed)) {
          skillProgress[skillType].completed++;
        }
      }
    });
  });

  // Calculate activity stats
  const recentActivity = lessonProgressData
    .filter((lp) => lp.completedAt)
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 10); // Last 10 completed lessons

  // Calculate total time spent (estimate based on lesson duration)
  const totalTimeSpent = lessonProgressData
    .filter((lp) => lp.completed)
    .reduce((sum, lp) => {
      const lesson = enrollment.course.units
        .flatMap((u) => u.lessons)
        .find((l) => l.id === lp.lessonId);
      return sum + (lesson?.estimatedDuration || 0);
    }, 0);

  return {
    enrollment,
    lessonProgress: lessonProgressData,
    challengeProgress: challengeProgressData,
    skillProgress,
    recentActivity,
    totalTimeSpent,
  };
};

