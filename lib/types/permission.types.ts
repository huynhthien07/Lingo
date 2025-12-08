/**
 * Permission Types
 * Defines all permission-related types
 */

export enum Permission {
  // User Management
  USER_VIEW = "user:view",
  USER_VIEW_ALL = "user:view:all",
  USER_VIEW_STUDENTS = "user:view:students",
  USER_VIEW_SELF = "user:view:self",
  USER_CREATE = "user:create",
  USER_UPDATE = "user:update",
  USER_UPDATE_STUDENTS = "user:update:students",
  USER_UPDATE_SELF = "user:update:self",
  USER_DELETE = "user:delete",
  USER_BLOCK = "user:block",
  
  // Course Management
  COURSE_VIEW = "course:view",
  COURSE_VIEW_ALL = "course:view:all",
  COURSE_VIEW_OWN = "course:view:own",
  COURSE_VIEW_PUBLISHED = "course:view:published",
  COURSE_CREATE = "course:create",
  COURSE_UPDATE = "course:update",
  COURSE_UPDATE_OWN = "course:update:own",
  COURSE_DELETE = "course:delete",
  COURSE_DELETE_OWN = "course:delete:own",
  COURSE_PUBLISH = "course:publish",
  
  // Lesson Management
  LESSON_VIEW = "lesson:view",
  LESSON_CREATE = "lesson:create",
  LESSON_UPDATE = "lesson:update",
  LESSON_DELETE = "lesson:delete",
  
  // Unit Management
  UNIT_VIEW = "unit:view",
  UNIT_CREATE = "unit:create",
  UNIT_UPDATE = "unit:update",
  UNIT_DELETE = "unit:delete",
  
  // Challenge Management
  CHALLENGE_VIEW = "challenge:view",
  CHALLENGE_CREATE = "challenge:create",
  CHALLENGE_UPDATE = "challenge:update",
  CHALLENGE_DELETE = "challenge:delete",
  
  // Enrollment Management
  ENROLLMENT_VIEW = "enrollment:view",
  ENROLLMENT_VIEW_ALL = "enrollment:view:all",
  ENROLLMENT_VIEW_OWN = "enrollment:view:own",
  ENROLLMENT_CREATE = "enrollment:create",
  ENROLLMENT_DELETE = "enrollment:delete",
  
  // Analytics
  ANALYTICS_VIEW_ALL = "analytics:view:all",
  ANALYTICS_VIEW_OWN = "analytics:view:own",
  ANALYTICS_VIEW_STUDENTS = "analytics:view:students",
  
  // Content Management
  CONTENT_CREATE = "content:create",
  CONTENT_UPDATE = "content:update",
  CONTENT_DELETE = "content:delete",
  
  // Test Management
  TEST_VIEW = "test:view",
  TEST_CREATE = "test:create",
  TEST_UPDATE = "test:update",
  TEST_DELETE = "test:delete",
  TEST_GRADE = "test:grade",
}

export type Role = "ADMIN" | "TEACHER" | "STUDENT";

export interface PermissionCheck {
  userId: string;
  permission: Permission;
  resourceOwnerId?: string; // For checking ownership
}

export interface RolePermissions {
  role: Role;
  permissions: Permission[];
}

