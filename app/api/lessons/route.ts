import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { ilike, eq, and, count, desc, asc, inArray } from "drizzle-orm";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const titleFilter = searchParams.get('title');
        const unitIdFilter = searchParams.get('unitId');
        const filterParam = searchParams.get('filter');

        // Pagination parameters
        const page = parseInt(searchParams.get('_page') || '1', 10);
        const limit = parseInt(searchParams.get('_limit') || '25', 10);
        const offset = (page - 1) * limit;

        // Sorting parameters
        const sortField = searchParams.get('_sort') || 'order';
        const sortOrder = searchParams.get('_order') || 'asc';

        // Build where conditions
        const conditions = [];

        // Handle React Admin filter parameter (JSON encoded)
        if (filterParam) {
            try {
                const filter = JSON.parse(decodeURIComponent(filterParam));

                // Handle id array filter (for ReferenceInput)
                if (filter.id && Array.isArray(filter.id)) {
                    conditions.push(inArray(lessons.id, filter.id.map((id: any) => parseInt(id))));
                }

                // Handle other filters from the parsed filter object
                if (filter.title) {
                    conditions.push(ilike(lessons.title, `%${filter.title}%`));
                }
                if (filter.unitId) {
                    conditions.push(eq(lessons.unitId, parseInt(filter.unitId)));
                }
            } catch (e) {
                console.warn('Failed to parse filter parameter:', e);
            }
        }

        // Handle direct filter parameters (for backward compatibility)
        if (titleFilter) {
            conditions.push(ilike(lessons.title, `%${titleFilter}%`));
        }
        if (unitIdFilter) {
            conditions.push(eq(lessons.unitId, parseInt(unitIdFilter)));
        }

        const whereCondition = conditions.length > 0 ?
            (conditions.length > 1 ? and(...conditions) : conditions[0]) :
            undefined;

        // Get total count for pagination
        const totalResult = await db.select({ count: count() })
            .from(lessons)
            .where(whereCondition);
        const total = totalResult[0]?.count || 0;

        // Determine sort order
        const orderBy = sortField === 'order' ?
            (sortOrder === 'desc' ? desc(lessons.order) : asc(lessons.order)) :
            sortField === 'title' ?
                (sortOrder === 'desc' ? desc(lessons.title) : asc(lessons.title)) :
                asc(lessons.id);

        // Get paginated data with relations
        const data = await db.query.lessons.findMany({
            where: whereCondition,
            with: {
                unit: true,
            },
            orderBy: [orderBy],
            limit: limit,
            offset: offset,
        });

        const response = NextResponse.json(data);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Remove id from body to let database auto-generate it
    const { id, ...lessonData } = body;

    const data = await db.insert(lessons).values({
        ...lessonData,
    }).returning();

    return NextResponse.json(data[0]);
}