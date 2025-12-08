import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import db from "@/db/drizzle";
import { courses, units, lessons, challenges, users } from "@/db/schema";
import { count, eq } from "drizzle-orm";

export const GET = async () => {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Get counts for all content types in parallel
        const [
            coursesCount,
            unitsCount,
            lessonsCount,
            challengesCount,
            blockedUsersCount
        ] = await Promise.all([
            db.select({ count: count() }).from(courses),
            db.select({ count: count() }).from(units),
            db.select({ count: count() }).from(lessons),
            db.select({ count: count() }).from(challenges),
            db.select({ count: count() }).from(users).where(eq(users.status, 'blocked'))
        ]);

        const contentStats = {
            courses: coursesCount[0]?.count || 0,
            units: unitsCount[0]?.count || 0,
            lessons: lessonsCount[0]?.count || 0,
            challenges: challengesCount[0]?.count || 0,
            blockedUsers: blockedUsersCount[0]?.count || 0
        };

        return NextResponse.json(contentStats);
    } catch (error) {
        console.error("Error fetching content statistics:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
