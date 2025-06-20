import db from '@/db/drizzle';
import { userProgress } from '@/db/schema';
import { getIsAdmin } from '@/lib/admin';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export const GET = async (
    req: Request,
    { params }: { params: { userId: string } },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const data = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, params.userId),
            with: {
                activeCourse: true,
            },
        });

        if (!data) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Map userId to id for React Admin compatibility
        const mappedData = {
            ...data,
            id: data.userId
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error("Error fetching user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: { userId: string } },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();

        // Only allow updating specific fields for security
        const allowedFields = ['blocked', 'userName', 'userImageSrc'];
        const updateData: any = {};

        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return new NextResponse("No valid fields to update", { status: 400 });
        }

        const data = await db.update(userProgress)
            .set(updateData)
            .where(eq(userProgress.userId, params.userId))
            .returning();

        if (data.length === 0) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Map userId to id for React Admin compatibility
        const mappedData = {
            ...data[0],
            id: data[0].userId
        };

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error("Error updating user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
