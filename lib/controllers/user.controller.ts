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

// ============================================
// ADMIN USER MANAGEMENT (by database ID)
// ============================================

/**
 * Get all admin users (by database ID)
 */
export const getAllAdminUsers = async (filters: {
  userName?: string;
  email?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
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
  if (role) conditions.push(eq(users.role, role as any));

  const whereCondition = conditions.length > 0 ? and(...conditions) : undefined;

  // Get data
  const data = await db.query.users.findMany({
    where: whereCondition,
    limit,
    offset,
    orderBy: sortOrder === 'asc'
      ? asc(users.createdAt)
      : desc(users.createdAt),
  });

  // Get total count
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(users)
    .where(whereCondition);

  return { data, total: Number(total) };
};

/**
 * Create admin user
 */
export const createAdminUser = async (data: {
  userName: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
}) => {
  const { userName, email, password, firstName, lastName, role = 'STUDENT', status = 'active' } = data;

  if (!userName || !email) {
    throw new Error('userName and email are required fields');
  }

  // Create in Clerk
  const clerkUser = await createClerkUser({
    username: userName,
    email,
    password,
    firstName,
    lastName,
    role,
  });

  // Create in database
  const [user] = await db.insert(users).values({
    userId: clerkUser.id,
    userName,
    email,
    firstName: firstName || null,
    lastName: lastName || null,
    role: role as any,
    status: status as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning();

  return user;
};

/**
 * Update admin user by database ID
 * Protects userId, id, createdAt from being changed
 */
export const updateAdminUser = async (id: number, data: any) => {
  // Find user by database id
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if trying to block admin
  if (data.status === 'blocked' && isProtectedAdmin(user.userId)) {
    throw new Error("Cannot block admin account");
  }

  // Remove protected fields from update data
  // Strip id, userId, createdAt, updatedAt, lastLoginAt
  const { id: _, userId, createdAt, updatedAt, lastLoginAt, ...updateData } = data;

  console.log('🔄 updateAdminUser - User ID:', id);
  console.log('🔄 updateAdminUser - Update data:', updateData);

  // If role is being updated, update Clerk metadata to prevent webhook from overwriting
  if (updateData.role && updateData.role !== user.role) {
    console.log(`🔄 Updating Clerk metadata - Role: ${user.role} → ${updateData.role}`);
    try {
      await updateClerkUser(user.userId, {
        publicMetadata: {
          role: updateData.role,
        },
      });
      console.log('✅ Clerk metadata updated');
    } catch (error) {
      console.error('❌ Error updating Clerk metadata:', error);
      // Continue with database update even if Clerk update fails
    }
  }

  // Update in database
  const [updated] = await db
    .update(users)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id))
    .returning();

  console.log('✅ updateAdminUser - Updated user:', updated);

  return updated;
};

/**
 * Delete admin user by database ID
 * Cannot delete protected admin accounts
 */
export const deleteAdminUser = async (id: number) => {
  // Find user by database id
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Cannot delete protected admin accounts
  if (isProtectedAdmin(user.userId)) {
    throw new Error("Cannot delete protected admin account");
  }

  console.log('🗑️ deleteAdminUser - Deleting user ID:', id);

  // Delete from Clerk first
  try {
    await deleteClerkUser(user.userId);
  } catch (error) {
    console.error('⚠️ Error deleting from Clerk:', error);
    // Continue with database deletion even if Clerk deletion fails
  }

  // Delete from database
  await db.delete(users).where(eq(users.id, id));

  console.log('✅ deleteAdminUser - User deleted:', id);

  return { success: true };
};

/**
 * Get admin user by database ID
 */
export const getAdminUserById = async (id: number) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  if (!user) {
    throw new Error("User not found");
  }

  console.log('🔍 getAdminUserById - User data:', user);
  console.log('🔍 getAdminUserById - userId field:', user.userId);

  return user;
};
