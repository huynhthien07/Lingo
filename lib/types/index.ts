/**
 * Shared Types Index
 * 
 * Central export point for all shared types
 */

// User types
export type {
    User,
    UserRole,
    UserStatus,
    CreateUserDTO,
    UpdateUserDTO,
    UserWithProgress,
} from './userTypes';

// API types
export type {
    PaginationParams,
    PaginatedResponse,
    ApiError,
    ApiSuccess,
    FilterParams,
    SortParams,
    ListQueryParams,
} from './apiTypes';

// Course types
export type {
    Course,
    CreateCourseDTO,
    UpdateCourseDTO,
    Unit,
    CreateUnitDTO,
    UpdateUnitDTO,
    Lesson,
    CreateLessonDTO,
    UpdateLessonDTO,
    Challenge,
    ChallengeType,
    CreateChallengeDTO,
    UpdateChallengeDTO,
} from './courseTypes';

