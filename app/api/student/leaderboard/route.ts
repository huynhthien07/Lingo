/**
 * API Route: Get Leaderboard Data
 * GET /api/student/leaderboard
 * 
 * Returns leaderboard rankings based on period and course
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import db from "@/db/drizzle";
import { users, userProgress, courseEnrollments, courses } from "@/db/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "ALL_TIME"; // DAILY, WEEKLY, MONTHLY, ALL_TIME
    const courseId = searchParams.get("courseId"); // Optional: filter by course

    // Calculate date range based on period
    let dateFilter = null;
    const now = new Date();
    
    if (period === "DAILY") {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = gte(userProgress.updatedAt, startOfDay);
    } else if (period === "WEEKLY") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      dateFilter = gte(userProgress.updatedAt, startOfWeek);
    } else if (period === "MONTHLY") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = gte(userProgress.updatedAt, startOfMonth);
    }

    // Build query to get top users by points
    let query = db
      .select({
        userId: users.userId,
        userName: users.name,
        userEmail: users.email,
        userImageSrc: users.imageSrc,
        points: userProgress.points,
        activeCourseId: userProgress.activeCourseId,
      })
      .from(userProgress)
      .innerJoin(users, eq(userProgress.userId, users.userId))
      .orderBy(desc(userProgress.points))
      .limit(100);

    // Apply date filter if needed
    if (dateFilter) {
      query = query.where(dateFilter) as any;
    }

    const topUsers = await query;

    // If courseId is specified, filter users enrolled in that course
    let filteredUsers = topUsers;
    if (courseId) {
      const enrolledUserIds = await db
        .select({ userId: courseEnrollments.userId })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, parseInt(courseId)));

      const enrolledSet = new Set(enrolledUserIds.map(e => e.userId));
      filteredUsers = topUsers.filter(user => enrolledSet.has(user.userId));
    }

    // Add rank to each user
    const leaderboard = filteredUsers.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      userName: user.userName || "Anonymous",
      userImageSrc: user.userImageSrc,
      points: user.points || 0,
      isCurrentUser: user.userId === userId,
    }));

    // Find current user's rank
    const currentUserRank = leaderboard.find(entry => entry.isCurrentUser);
    const currentUserPosition = currentUserRank ? currentUserRank.rank : null;

    // Get course info if courseId is specified
    let courseInfo = null;
    if (courseId) {
      const [course] = await db
        .select({ id: courses.id, title: courses.title })
        .from(courses)
        .where(eq(courses.id, parseInt(courseId)))
        .limit(1);
      courseInfo = course || null;
    }

    return NextResponse.json({
      period,
      courseId: courseId ? parseInt(courseId) : null,
      courseTitle: courseInfo?.title || null,
      leaderboard,
      currentUserPosition,
      totalUsers: leaderboard.length,
    }, { status: 200 });

  } catch (error) {
    console.error("❌ Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}

