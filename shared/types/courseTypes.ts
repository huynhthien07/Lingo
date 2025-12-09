/**
 * Course Types
 * 
 * Shared type definitions for course-related data
 */

/**
 * Course interface
 */
export interface Course {
    id: number;
    title: string;
    imageSrc: string;
    level?: string | null;
    description?: string | null;
    price?: number | null;
}

/**
 * Create course DTO
 */
export interface CreateCourseDTO {
    title: string;
    imageSrc: string;
    level?: string;
    description?: string;
    price?: number;
}

/**
 * Update course DTO
 */
export interface UpdateCourseDTO {
    title?: string;
    imageSrc?: string;
    level?: string;
    description?: string;
    price?: number;
}

/**
 * Unit interface
 */
export interface Unit {
    id: number;
    title: string;
    description: string;
    courseId: number;
    order: number;
}

/**
 * Create unit DTO
 */
export interface CreateUnitDTO {
    title: string;
    description: string;
    courseId: number;
    order: number;
}

/**
 * Update unit DTO
 */
export interface UpdateUnitDTO {
    title?: string;
    description?: string;
    courseId?: number;
    order?: number;
}

/**
 * Lesson interface
 */
export interface Lesson {
    id: number;
    title: string;
    unitId: number;
    order: number;
}

/**
 * Create lesson DTO
 */
export interface CreateLessonDTO {
    title: string;
    unitId: number;
    order: number;
}

/**
 * Update lesson DTO
 */
export interface UpdateLessonDTO {
    title?: string;
    unitId?: number;
    order?: number;
}

/**
 * Challenge type enum
 */
export type ChallengeType = 'SELECT' | 'ASSIST' | 'LISTENING' | 'READING' | 'WRITING' | 'SPEAKING';

/**
 * Challenge interface
 */
export interface Challenge {
    id: number;
    lessonId: number;
    type: ChallengeType;
    question: string;
    order: number;
}

/**
 * Create challenge DTO
 */
export interface CreateChallengeDTO {
    lessonId: number;
    type: ChallengeType;
    question: string;
    order: number;
}

/**
 * Update challenge DTO
 */
export interface UpdateChallengeDTO {
    lessonId?: number;
    type?: ChallengeType;
    question?: string;
    order?: number;
}

