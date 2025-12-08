import { getIsAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';
import { getCourseById, updateCourse, deleteCourse } from '@/lib/controllers/course.controller';

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ courseId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const courseId = parseInt((await params).courseId);
        const course = await getCourseById(courseId);
        return NextResponse.json(course);
    } catch (error) {
        console.error("Error in GET /api/courses/[courseId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ courseId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const courseId = parseInt((await params).courseId);
        const body = await req.json();
        const updatedCourse = await updateCourse(courseId, body);
        return NextResponse.json(updatedCourse);
    } catch (error) {
        console.error("Error in PUT /api/courses/[courseId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ courseId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const courseId = parseInt((await params).courseId);
        const deletedCourse = await deleteCourse(courseId);
        return NextResponse.json(deletedCourse);
    } catch (error) {
        console.error("Error in DELETE /api/courses/[courseId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};