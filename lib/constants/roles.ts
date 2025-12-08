/**
 * Role Constants
 * 
 * Shared constants for user roles and permissions
 */

/**
 * User roles
 */
export const ROLES = {
    STUDENT: 'STUDENT',
    TEACHER: 'TEACHER',
    ADMIN: 'ADMIN',
} as const;

/**
 * Role labels for display
 */
export const ROLE_LABELS = {
    [ROLES.STUDENT]: 'Student',
    [ROLES.TEACHER]: 'Teacher',
    [ROLES.ADMIN]: 'Admin',
} as const;

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS = {
    [ROLES.STUDENT]: 'Can access courses and take tests',
    [ROLES.TEACHER]: 'Can create and manage course content',
    [ROLES.ADMIN]: 'Full system access and user management',
} as const;

/**
 * Role permissions
 */
export const ROLE_PERMISSIONS = {
    [ROLES.STUDENT]: [
        'view_courses',
        'take_tests',
        'view_progress',
        'use_chatbot',
    ],
    [ROLES.TEACHER]: [
        'view_courses',
        'create_courses',
        'edit_courses',
        'view_students',
        'grade_tests',
    ],
    [ROLES.ADMIN]: [
        'view_courses',
        'create_courses',
        'edit_courses',
        'delete_courses',
        'view_users',
        'create_users',
        'edit_users',
        'delete_users',
        'manage_roles',
        'view_analytics',
        'manage_settings',
    ],
} as const;

/**
 * Check if role has permission
 */
export const hasPermission = (role: string, permission: string): boolean => {
    const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
    return permissions ? permissions.includes(permission as any) : false;
};

