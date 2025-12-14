/**
 * Course Controller
 * 
 * Handles all course-related business logic
 */

import { db } from "@/lib/services/database.service";
import { courses } from "@/db/schema";
import { eq, ilike, count, desc, asc, inArray } from "drizzle-orm";

/**
 * Get all courses with pagination, filtering, and sorting
 */
export const getAllCourses = async (params: {
    title?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}) => {
    const {
        title,
        page = 1,
        limit = 25,
        sortField = 'title',
        sortOrder = 'asc'
    } = params;

    const offset = (page - 1) * limit;

    // Build where condition
    const whereCondition = title ?
        ilike(courses.title, `%${title}%`) :
        undefined;

    // Get total count for pagination
    const totalResult = await db.select({ count: count() })
        .from(courses)
        .where(whereCondition);
    const total = totalResult[0]?.count || 0;

    // Determine sort order
    const orderBy = sortField === 'title' ?
        (sortOrder === 'desc' ? desc(courses.title) : asc(courses.title)) :
        asc(courses.id);

    // Get paginated data
    const data = await db.query.courses.findMany({
        where: whereCondition,
        orderBy: [orderBy],
        limit: limit,
        offset: offset,
    });

    return {
        data,
        total,
        page,
        limit,
    };
};

/**
 * Get course by ID
 */
export const getCourseById = async (courseId: number) => {
    const course = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!course) {
        throw new Error("Course not found");
    }

    return course;
};

/**
 * Create a new course
 */
export const createCourse = async (courseData: {
    title: string;
    imageSrc: string;
    createdBy: string;
    level?: string;
    description?: string;
    price?: number;
}) => {
    const { title, imageSrc, createdBy, level, description, price } = courseData;

    // Validate required fields
    if (!title || !imageSrc || !createdBy) {
        throw new Error("Title, imageSrc, and createdBy are required");
    }

    // Check for duplicate title
    const existingCourse = await db.query.courses.findFirst({
        where: eq(courses.title, title),
    });

    if (existingCourse) {
        throw new Error("Course with this title already exists");
    }

    // Create course
    const newCourse = await db.insert(courses).values({
        title,
        imageSrc,
        createdBy,
        level: level || null,
        description: description || null,
        price: price || null,
    }).returning();

    return newCourse[0];
};

/**
 * Update course
 */
export const updateCourse = async (courseId: number, courseData: any) => {
    // Check if course exists
    const existingCourse = await db.query.courses.findFirst({
        where: eq(courses.id, courseId),
    });

    if (!existingCourse) {
        throw new Error("Course not found");
    }

    // Update course
    const updatedCourse = await db.update(courses)
        .set(courseData)
        .where(eq(courses.id, courseId))
        .returning();

    return updatedCourse[0];
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId: number) => {
    const deletedCourse = await db.delete(courses)
        .where(eq(courses.id, courseId))
        .returning();

    if (!deletedCourse || deletedCourse.length === 0) {
        throw new Error("Course not found");
    }

    return deletedCourse[0];
};

/**
 * Bulk delete courses
 */
export const bulkDeleteCourses = async (courseIds: number[]) => {
    if (!courseIds || courseIds.length === 0) {
        throw new Error("No course IDs provided");
    }

    const deletedCourses = await db.delete(courses)
        .where(inArray(courses.id, courseIds))
        .returning();

    return deletedCourses;
};

