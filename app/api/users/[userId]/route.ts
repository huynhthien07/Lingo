import { getIsAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';
import { db } from '@/lib/services/database.service';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ userId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const userId = (await params).userId;

        const user = await db.query.users.findFirst({
            where: eq(users.userId, userId),
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error in GET /api/users/[userId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ userId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const userId = (await params).userId;
        const body = await req.json();

        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.userId, userId),
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Update user
        const [updatedUser] = await db
            .update(users)
            .set(body)
            .where(eq(users.userId, userId))
            .returning();

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error in PUT /api/users/[userId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
