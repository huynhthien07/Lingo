import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAllCourses, createCourse } from "@/lib/controllers/course.controller";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const params = {
            title: searchParams.get('title') || undefined,
            page: parseInt(searchParams.get('_page') || '1', 10),
            limit: parseInt(searchParams.get('_limit') || '25', 10),
            sortField: searchParams.get('_sort') || 'title',
            sortOrder: (searchParams.get('_order') || 'asc') as 'asc' | 'desc',
        };

        const result = await getAllCourses(params);

        const response = NextResponse.json(result.data);
        response.headers.set('x-total-count', result.total.toString());
        return response;
    } catch (error) {
        console.error("Error in GET /api/courses:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...courseData } = body;

        const newCourse = await createCourse(courseData);

        return NextResponse.json(newCourse);
    } catch (error) {
        console.error("Error in POST /api/courses:", error);

        if (error instanceof Error) {
            if (error.message.includes('already exists')) {
                return new NextResponse(error.message, { status: 409 });
            }
            if (error.message.includes('required')) {
                return new NextResponse(error.message, { status: 400 });
            }
        }

        return new NextResponse("Failed to create course", { status: 500 });
    }
}