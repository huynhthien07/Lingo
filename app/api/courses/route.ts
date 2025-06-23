import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { ilike, count, desc, asc } from "drizzle-orm";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const titleFilter = searchParams.get('title');

        // Pagination parameters
        const page = parseInt(searchParams.get('_page') || '1', 10);
        const limit = parseInt(searchParams.get('_limit') || '25', 10);
        const offset = (page - 1) * limit;

        // Sorting parameters
        const sortField = searchParams.get('_sort') || 'title';
        const sortOrder = searchParams.get('_order') || 'asc';

        // Build where condition
        const whereCondition = titleFilter ?
            ilike(courses.title, `%${titleFilter}%`) :
            undefined;

        // Get total count for pagination
        const totalResult = await db.select({ count: count() })
            .from(courses)
            .where(whereCondition);
        const total = totalResult[0]?.count || 0;

        // Determine sort order
        const orderBy = sortField === 'title' ?
            (sortOrder === 'desc' ? desc(courses.title) : asc(courses.title)) :
            asc(courses.id);

        // Get paginated data
        const data = await db.query.courses.findMany({
            where: whereCondition,
            orderBy: [orderBy],
            limit: limit,
            offset: offset,
        });

        const response = NextResponse.json(data);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching courses:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        console.log("Received course data:", body);

        // Remove id from body to let database auto-generate it
        const { id, ...courseData } = body;
        console.log("Course data after removing id:", courseData);

        const data = await db.insert(courses).values({
            ...courseData,
        }).returning();

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error creating course:", error);

        // Check if it's a duplicate key error
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return new NextResponse("Course with this ID already exists. Please try again.", { status: 409 });
        }

        return new NextResponse("Failed to create course", { status: 500 });
    }
}