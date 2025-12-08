import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAllLessons, createLesson } from "@/lib/controllers/lesson.controller";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);

        // Parse filter parameter
        let filter;
        const filterParam = searchParams.get('filter');
        if (filterParam) {
            try {
                filter = JSON.parse(decodeURIComponent(filterParam));
            } catch (e) {
                console.warn('Failed to parse filter parameter:', e);
            }
        }

        const params = {
            title: searchParams.get('title') || undefined,
            unitId: searchParams.get('unitId') ? parseInt(searchParams.get('unitId')!) : undefined,
            filter: filter,
            page: parseInt(searchParams.get('_page') || '1', 10),
            limit: parseInt(searchParams.get('_limit') || '25', 10),
            sortField: searchParams.get('_sort') || 'order',
            sortOrder: (searchParams.get('_order') || 'asc') as 'asc' | 'desc',
        };

        const result = await getAllLessons(params);

        const response = NextResponse.json(result.data);
        response.headers.set('x-total-count', result.total.toString());
        return response;
    } catch (error) {
        console.error("Error in GET /api/lessons:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...lessonData } = body;

        const newLesson = await createLesson(lessonData);

        return NextResponse.json(newLesson);
    } catch (error) {
        console.error("Error in POST /api/lessons:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}