/**
 * Permission Service
 * Centralized permission checking for all roles
 */

import { getUserRole } from "@/lib/services/clerk.service";
import { db } from "@/lib/services/database.service";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Permission, Role, PermissionCheck } from "@/lib/types/permission.types";
import { ROLE_PERMISSIONS, PROTECTED_ADMIN_IDS } from "@/lib/constants/permissions";

/**
 * Get user role from database (fallback to Clerk if not found)
 */
export const getUserRoleFromDB = async (userId: string): Promise<string> => {
  try {
    // Try to get from database first
    const user = await db.query.users.findFirst({
      where: eq(users.userId, userId),
      columns: { role: true }
    });

    if (user?.role) {
      return user.role;
    }

    // Fallback to Clerk
    return await getUserRole(userId);
  } catch (error) {
    console.error("Error getting user role:", error);
    return "STUDENT"; // Default to STUDENT if error
  }
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = async (
  userId: string,
  permission: Permission
): Promise<boolean> => {
  const role = await getUserRoleFromDB(userId);
  const permissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.includes(permission);
};

/**
 * Check multiple permissions (AND logic - user must have ALL)
 */
export const hasAllPermissions = async (
  userId: string,
  permissions: Permission[]
): Promise<boolean> => {
  const role = await getUserRoleFromDB(userId);
  const userPermissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.every(p => userPermissions.includes(p));
};

/**
 * Check multiple permissions (OR logic - user must have ANY)
 */
export const hasAnyPermission = async (
  userId: string,
  permissions: Permission[]
): Promise<boolean> => {
  const role = await getUserRoleFromDB(userId);
  const userPermissions = ROLE_PERMISSIONS[role as Role] || [];
  return permissions.some(p => userPermissions.includes(p));
};

/**
 * Require permission (throw error if not authorized)
 */
export const requirePermission = async (
  userId: string,
  permission: Permission
): Promise<void> => {
  const allowed = await hasPermission(userId, permission);
  if (!allowed) {
    throw new Error(`Permission denied: ${permission}`);
  }
};

/**
 * Require multiple permissions (AND logic)
 */
export const requireAllPermissions = async (
  userId: string,
  permissions: Permission[]
): Promise<void> => {
  const allowed = await hasAllPermissions(userId, permissions);
  if (!allowed) {
    throw new Error(`Permission denied: Required all of ${permissions.join(", ")}`);
  }
};

/**
 * Require any of multiple permissions (OR logic)
 */
export const requireAnyPermission = async (
  userId: string,
  permissions: Permission[]
): Promise<void> => {
  const allowed = await hasAnyPermission(userId, permissions);
  if (!allowed) {
    throw new Error(`Permission denied: Required any of ${permissions.join(", ")}`);
  }
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role: Role): Permission[] => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Check if user is admin
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  const role = await getUserRoleFromDB(userId);
  return role === "ADMIN";
};

/**
 * Check if user is teacher
 */
export const isTeacher = async (userId: string): Promise<boolean> => {
  const role = await getUserRoleFromDB(userId);
  return role === "TEACHER";
};

/**
 * Check if user is student
 */
export const isStudent = async (userId: string): Promise<boolean> => {
  const role = await getUserRoleFromDB(userId);
  return role === "STUDENT";
};

/**
 * Check if user is protected admin (cannot be blocked/deleted)
 */
export const isProtectedAdmin = (userId: string): boolean => {
  return PROTECTED_ADMIN_IDS.includes(userId);
};

/**
 * Check if user can modify target user
 * @param requesterId - User making the request
 * @param targetUserId - User being modified
 * @param targetUserRole - Role of target user
 */
export const canModifyUser = async (
  requesterId: string,
  targetUserId: string,
  targetUserRole: string
): Promise<boolean> => {
  const requesterRole = await getUserRoleFromDB(requesterId);

  // Admins can modify anyone (except protected admins)
  if (requesterRole === "ADMIN") {
    return !isProtectedAdmin(targetUserId);
  }

  // Teachers can only modify students
  if (requesterRole === "TEACHER") {
    return targetUserRole === "STUDENT";
  }

  // Students can only modify themselves
  if (requesterRole === "STUDENT") {
    return requesterId === targetUserId;
  }

  return false;
};

/**
 * Check if user owns a resource
 */
export const isResourceOwner = (
  userId: string,
  resourceOwnerId: string | null | undefined
): boolean => {
  if (!resourceOwnerId) return false;
  return userId === resourceOwnerId;
};

