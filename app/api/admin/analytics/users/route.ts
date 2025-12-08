/**
 * Admin Analytics API - User Statistics
 * 
 * Returns user analytics including:
 * - Total users count
 * - Active vs blocked users
 * - Monthly new users
 * - Role distribution (STUDENT, TEACHER, ADMIN)
 * 
 * Reference: UC34 - User Management
 */

import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, count, and, gte, sql } from "drizzle-orm";

export async function GET() {
    try {
        // Get total users count
        const totalUsersResult = await db
            .select({ count: count() })
            .from(users);
        const totalUsers = totalUsersResult[0]?.count || 0;

        // Get active users count
        const activeUsersResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.status, "active"));
        const activeUsers = activeUsersResult[0]?.count || 0;

        // Get blocked users count
        const blockedUsersResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.status, "blocked"));
        const blockedUsers = blockedUsersResult[0]?.count || 0;

        // Get monthly new users (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const monthlyNewUsersResult = await db
            .select({ count: count() })
            .from(users)
            .where(gte(users.createdAt, thirtyDaysAgo));
        const monthlyNewUsers = monthlyNewUsersResult[0]?.count || 0;

        // Get role distribution
        const studentCountResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, "STUDENT"));
        const studentCount = studentCountResult[0]?.count || 0;

        const teacherCountResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, "TEACHER"));
        const teacherCount = teacherCountResult[0]?.count || 0;

        const adminCountResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.role, "ADMIN"));
        const adminCount = adminCountResult[0]?.count || 0;

        return NextResponse.json({
            totalUsers,
            activeUsers,
            blockedUsers,
            monthlyNewUsers,
            studentCount,
            teacherCount,
            adminCount,
        });
    } catch (error) {
        console.error("Error fetching user analytics:", error);
        return NextResponse.json(
            { error: "Failed to fetch user analytics" },
            { status: 500 }
        );
    }
}

