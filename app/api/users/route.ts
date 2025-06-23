import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq, ilike, and, count, desc, asc } from "drizzle-orm";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const userNameFilter = searchParams.get('userName');
        const blockedFilter = searchParams.get('blocked');
        const activeCourseIdFilter = searchParams.get('activeCourseId');

        // Pagination parameters
        const page = parseInt(searchParams.get('_page') || '1', 10);
        const limit = parseInt(searchParams.get('_limit') || '25', 10);
        const offset = (page - 1) * limit;

        // Sorting parameters
        const sortField = searchParams.get('_sort') || 'points';
        const sortOrder = searchParams.get('_order') || 'desc';

        // Build where conditions
        const conditions = [];
        if (userNameFilter) {
            conditions.push(ilike(userProgress.userName, `%${userNameFilter}%`));
        }
        if (blockedFilter) {
            conditions.push(eq(userProgress.blocked, blockedFilter === 'true'));
        }
        if (activeCourseIdFilter) {
            conditions.push(eq(userProgress.activeCourseId, parseInt(activeCourseIdFilter, 10)));
        }

        const whereCondition = conditions.length > 0 ?
            (conditions.length > 1 ? and(...conditions) : conditions[0]) :
            undefined;

        // Get total count for pagination
        const totalResult = await db.select({ count: count() })
            .from(userProgress)
            .where(whereCondition);
        const total = totalResult[0]?.count || 0;

        // Determine sort order
        const orderBy = sortField === 'points' ?
            (sortOrder === 'desc' ? desc(userProgress.points) : asc(userProgress.points)) :
            (sortOrder === 'desc' ? desc(userProgress.userName) : asc(userProgress.userName));

        // Get paginated data with relations
        const data = await db.query.userProgress.findMany({
            where: whereCondition,
            with: {
                activeCourse: true,
            },
            orderBy: [orderBy],
            limit: limit,
            offset: offset,
        });

        // Map userId to id for React Admin compatibility
        const mappedData = data.map(user => ({
            ...user,
            id: user.userId
        }));

        const response = NextResponse.json(mappedData);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
