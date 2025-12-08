/**
 * Permission Constants
 * Role-Permission mapping
 */

import { Permission, Role, RolePermissions } from "@/lib/types/permission.types";

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  ADMIN: [
    // Full access to everything
    Permission.USER_VIEW,
    Permission.USER_VIEW_ALL,
    Permission.USER_CREATE,
    Permission.USER_UPDATE,
    Permission.USER_DELETE,
    Permission.USER_BLOCK,
    
    Permission.COURSE_VIEW,
    Permission.COURSE_VIEW_ALL,
    Permission.COURSE_CREATE,
    Permission.COURSE_UPDATE,
    Permission.COURSE_DELETE,
    Permission.COURSE_PUBLISH,
    
    Permission.LESSON_VIEW,
    Permission.LESSON_CREATE,
    Permission.LESSON_UPDATE,
    Permission.LESSON_DELETE,
    
    Permission.UNIT_VIEW,
    Permission.UNIT_CREATE,
    Permission.UNIT_UPDATE,
    Permission.UNIT_DELETE,
    
    Permission.CHALLENGE_VIEW,
    Permission.CHALLENGE_CREATE,
    Permission.CHALLENGE_UPDATE,
    Permission.CHALLENGE_DELETE,
    
    Permission.ENROLLMENT_VIEW,
    Permission.ENROLLMENT_VIEW_ALL,
    Permission.ENROLLMENT_CREATE,
    Permission.ENROLLMENT_DELETE,
    
    Permission.ANALYTICS_VIEW_ALL,
    
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    Permission.CONTENT_DELETE,
    
    Permission.TEST_VIEW,
    Permission.TEST_CREATE,
    Permission.TEST_UPDATE,
    Permission.TEST_DELETE,
    Permission.TEST_GRADE,
  ],
  
  TEACHER: [
    // Limited user access
    Permission.USER_VIEW,
    Permission.USER_VIEW_STUDENTS,
    Permission.USER_UPDATE_STUDENTS,
    
    // Course management (own courses)
    Permission.COURSE_VIEW,
    Permission.COURSE_VIEW_ALL,
    Permission.COURSE_VIEW_OWN,
    Permission.COURSE_CREATE,
    Permission.COURSE_UPDATE_OWN,
    Permission.COURSE_DELETE_OWN,
    
    // Content management
    Permission.LESSON_VIEW,
    Permission.LESSON_CREATE,
    Permission.LESSON_UPDATE,
    Permission.LESSON_DELETE,
    
    Permission.UNIT_VIEW,
    Permission.UNIT_CREATE,
    Permission.UNIT_UPDATE,
    Permission.UNIT_DELETE,
    
    Permission.CHALLENGE_VIEW,
    Permission.CHALLENGE_CREATE,
    Permission.CHALLENGE_UPDATE,
    Permission.CHALLENGE_DELETE,
    
    // Enrollment (view students in their courses)
    Permission.ENROLLMENT_VIEW,
    Permission.ENROLLMENT_VIEW_OWN,
    
    // Analytics (own courses)
    Permission.ANALYTICS_VIEW_OWN,
    Permission.ANALYTICS_VIEW_STUDENTS,
    
    Permission.CONTENT_CREATE,
    Permission.CONTENT_UPDATE,
    
    // Test management
    Permission.TEST_VIEW,
    Permission.TEST_CREATE,
    Permission.TEST_UPDATE,
    Permission.TEST_GRADE,
  ],
  
  STUDENT: [
    // Minimal access
    Permission.USER_VIEW_SELF,
    Permission.USER_UPDATE_SELF,
    
    // View published courses only
    Permission.COURSE_VIEW,
    Permission.COURSE_VIEW_PUBLISHED,
    
    Permission.LESSON_VIEW,
    Permission.UNIT_VIEW,
    Permission.CHALLENGE_VIEW,
    
    // Own enrollments
    Permission.ENROLLMENT_VIEW,
    Permission.ENROLLMENT_VIEW_OWN,
    Permission.ENROLLMENT_CREATE,
    
    // Own analytics
    Permission.ANALYTICS_VIEW_OWN,
    
    // View tests
    Permission.TEST_VIEW,
  ],
};

// Protected admin accounts that cannot be blocked/deleted
export const PROTECTED_ADMIN_IDS = [
  "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY"
];

