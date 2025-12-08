import { getIsAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';
import { getLessonById, updateLesson, deleteLesson } from '@/lib/controllers/lesson.controller';

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const lessonId = parseInt((await params).lessonId);
        const lesson = await getLessonById(lessonId);
        return NextResponse.json(lesson);
    } catch (error) {
        console.error("Error in GET /api/lessons/[lessonId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const lessonId = parseInt((await params).lessonId);
        const body = await req.json();
        const updatedLesson = await updateLesson(lessonId, body);
        return NextResponse.json(updatedLesson);
    } catch (error) {
        console.error("Error in PUT /api/lessons/[lessonId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ lessonId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const lessonId = parseInt((await params).lessonId);
        const deletedLesson = await deleteLesson(lessonId);
        return NextResponse.json(deletedLesson);
    } catch (error) {
        console.error("Error in DELETE /api/lessons/[lessonId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};