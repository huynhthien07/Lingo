import db from '@/db/drizzle';
import { userProgress } from '@/db/schema';
import { getIsAdmin } from '@/lib/admin';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Admin user IDs that cannot be blocked
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ userId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const data = await db.query.userProgress.findFirst({
            where: eq(userProgress.userId, (await params).userId),
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
    { params }: { params: Promise<{ userId: string }> },
) => {
    if (!await getIsAdmin()) {
        console.log("❌ PUT /api/users/[userId] - Unauthorized access attempt");
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const userId = (await params).userId;
        const body = await req.json();

        console.log(`🔄 PUT /api/users/${userId} - Request received`);
        console.log("📝 Request body:", JSON.stringify(body, null, 2));

        // Check if trying to block an admin account
        if ('blocked' in body && body.blocked === true && adminIds.includes(userId)) {
            console.log(`❌ Attempt to block admin account: ${userId}`);
            return new NextResponse("Cannot block admin account", { status: 403 });
        }

        // Only allow updating specific fields for security
        const allowedFields = ['blocked', 'userName', 'userImageSrc', 'hearts', 'points', 'activeCourseId'];
        const updateData: any = {};

        for (const field of allowedFields) {
            if (field in body) {
                updateData[field] = body[field];
            }
        }

        console.log("✅ Filtered update data:", JSON.stringify(updateData, null, 2));

        if (Object.keys(updateData).length === 0) {
            console.log("❌ No valid fields to update");
            return new NextResponse("No valid fields to update", { status: 400 });
        }

        const data = await db.update(userProgress)
            .set(updateData)
            .where(eq(userProgress.userId, userId))
            .returning();

        if (data.length === 0) {
            console.log(`❌ User not found: ${userId}`);
            return new NextResponse("User not found", { status: 404 });
        }

        console.log("✅ Update successful:", JSON.stringify(data[0], null, 2));

        // Map userId to id for React Admin compatibility
        const mappedData = {
            ...data[0],
            id: data[0].userId
        };

        console.log("📤 Sending response:", JSON.stringify(mappedData, null, 2));
        return NextResponse.json(mappedData);
    } catch (error) {
        console.error("❌ Error updating user:", error);
        console.error("❌ Error details:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
