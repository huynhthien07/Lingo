/**
 * User Controller
 * Manages all user operations with role-based permissions
 */

import { db } from "@/lib/services/database.service";
import { users } from "@/db/schema";
import { eq, ilike, and, count, desc, asc, inArray } from "drizzle-orm";
import { 
  createClerkUser, 
  updateClerkUser, 
  deleteClerkUser,
  getUserRole 
} from "@/lib/services/clerk.service";
import { 
  requirePermission,
  canModifyUser,
  isProtectedAdmin,
  isAdmin,
  isTeacher
} from "@/lib/services/permission.service";
import { Permission } from "@/lib/types/permission.types";

/**
 * Get all users
 * ADMIN: See all users
 * TEACHER: See only students
 * STUDENT: Cannot access
 */
export const getAllUsers = async (
  requesterId: string,
  filters: {
    userName?: string;
    email?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
  }
) => {
  // Check permission
  await requirePermission(requesterId, Permission.USER_VIEW);

  const {
    userName,
    email,
    role,
    status,
    page = 1,
    limit = 25,
    sortField = 'createdAt',
    sortOrder = 'desc'
  } = filters;

  const offset = (page - 1) * limit;

  // Build where conditions
  const conditions = [];
  if (userName) conditions.push(ilike(users.userName, `%${userName}%`));
  if (email) conditions.push(ilike(users.email, `%${email}%`));
  if (status) conditions.push(eq(users.status, status));
  if (role) conditions.push(eq(users.role, role));

  // Teachers can only see students
  const requesterIsTeacher = await isTeacher(requesterId);
  if (requesterIsTeacher) {
    conditions.push(eq(users.role, "STUDENT"));
  }

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Get data
  const data = await db.query.users.findMany({
    where: whereCondition,
    limit,
    offset,
    orderBy: sortOrder === 'asc' 
      ? asc(users[sortField as keyof typeof users] || users.createdAt)
      : desc(users[sortField as keyof typeof users] || users.createdAt),
  });

  // Get total count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(users)
    .where(whereCondition);

  return { data, total: Number(total) };
};

/**
 * Get user by ID
 * ADMIN: Can view anyone
 * TEACHER: Can view students
 * STUDENT: Can view self only
 */
export const getUserById = async (
  requesterId: string,
  userId: string
) => {
  await requirePermission(requesterId, Permission.USER_VIEW);

  const user = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if requester can view this user
  const requesterRole = await getUserRole(requesterId);
  
  if (requesterRole === "STUDENT" && requesterId !== userId) {
    throw new Error("Permission denied: You can only view your own profile");
  }
  
  if (requesterRole === "TEACHER" && user.role !== "STUDENT" && requesterId !== userId) {
    throw new Error("Permission denied: Teachers can only view students");
  }

  return user;
};

/**
 * Create user
 * ADMIN only
 */
export const createUser = async (
  requesterId: string,
  data: {
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: string;
  }
) => {
  await requirePermission(requesterId, Permission.USER_CREATE);

  // Create in Clerk first
  const clerkUser = await createClerkUser({
    email: data.email,
    username: data.username,
    firstName: data.firstName,
    lastName: data.lastName,
    role: data.role,
  });

  // Create in database
  const [user] = await db.insert(users).values({
    userId: clerkUser.id,
    userName: data.username,
    email: data.email,
    role: data.role,
    status: "active",
  }).returning();

  return user;
};

/**
 * Update user
 * ADMIN: Can update anyone (except protected admins)
 * TEACHER: Can update students only
 * STUDENT: Can update self only (limited fields)
 */
export const updateUser = async (
  requesterId: string,
  userId: string,
  data: Partial<{
    userName: string;
    email: string;
    role: string;
    status: string;
  }>
) => {
  await requirePermission(requesterId, Permission.USER_UPDATE);

  // Get target user
  const targetUser = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  if (!targetUser) {
    throw new Error("User not found");
  }

  // Check if requester can modify this user
  const canModify = await canModifyUser(requesterId, userId, targetUser.role);
  if (!canModify) {
    throw new Error("Permission denied: You cannot modify this user");
  }

  const requesterRole = await getUserRole(requesterId);

  // Students cannot change role or status
  if (requesterRole === "STUDENT") {
    if (data.role || data.status) {
      throw new Error("Permission denied: You cannot change role or status");
    }
  }

  // Teachers cannot change role
  if (requesterRole === "TEACHER") {
    if (data.role) {
      throw new Error("Permission denied: Teachers cannot change user roles");
    }
  }

  // Cannot block protected admin accounts
  if (data.status === "blocked" && isProtectedAdmin(userId)) {
    throw new Error("Cannot block protected admin account");
  }

  // Update in Clerk if email/username changed
  if (data.email || data.userName) {
    await updateClerkUser(userId, {
      username: data.userName,
      email: data.email,
    });
  }

  // Update in database
  const [updated] = await db
    .update(users)
    .set(data)
    .where(eq(users.userId, userId))
    .returning();

  return updated;
};

/**
 * Delete user
 * ADMIN only (cannot delete protected admins)
 */
export const deleteUser = async (
  requesterId: string,
  userId: string
) => {
  await requirePermission(requesterId, Permission.USER_DELETE);

  // Cannot delete protected admin accounts
  if (isProtectedAdmin(userId)) {
    throw new Error("Cannot delete protected admin account");
  }

  // Delete from Clerk
  await deleteClerkUser(userId);

  // Delete from database
  await db.delete(users).where(eq(users.userId, userId));

  return { success: true };
};

/**
 * Bulk update users
 * ADMIN only
 */
export const bulkUpdateUsers = async (
  requesterId: string,
  userIds: string[],
  data: Partial<{ status: string; role: string }>
) => {
  await requirePermission(requesterId, Permission.USER_UPDATE);

  // Filter out protected admin accounts if blocking
  let targetIds = userIds;
  let skippedCount = 0;

  if (data.status === "blocked") {
    const usersToUpdate = await db.query.users.findMany({
      where: inArray(users.userId, userIds),
    });

    targetIds = usersToUpdate
      .filter(u => !isProtectedAdmin(u.userId))
      .map(u => u.userId);

    skippedCount = userIds.length - targetIds.length;
  }

  // Update
  const updated = await db
    .update(users)
    .set(data)
    .where(inArray(users.userId, targetIds))
    .returning();

  return {
    updated,
    updatedCount: updated.length,
    skippedCount,
  };
};

/**
 * Bulk delete users
 * ADMIN only
 */
export const bulkDeleteUsers = async (
  requesterId: string,
  userIds: string[]
) => {
  await requirePermission(requesterId, Permission.USER_DELETE);

  // Filter out protected admin accounts
  const usersToDelete = await db.query.users.findMany({
    where: inArray(users.userId, userIds),
  });

  const targetIds = usersToDelete
    .filter(u => !isProtectedAdmin(u.userId))
    .map(u => u.userId);

  const skippedCount = userIds.length - targetIds.length;

  // Delete from Clerk
  await Promise.all(targetIds.map(id => deleteClerkUser(id)));

  // Delete from database
  const deleted = await db
    .delete(users)
    .where(inArray(users.userId, targetIds))
    .returning();

  return {
    deleted,
    deletedCount: deleted.length,
    skippedCount,
  };
};

