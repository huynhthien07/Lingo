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
        const userIdParam = (await params).userId;

        // Try to find user by id (number) or userId (Clerk ID string)
        let user;

        // Check if it's a number (database id)
        if (!isNaN(Number(userIdParam))) {
            user = await db.query.users.findFirst({
                where: eq(users.id, parseInt(userIdParam)),
            });
        } else {
            // It's a Clerk userId string
            user = await db.query.users.findFirst({
                where: eq(users.userId, userIdParam),
            });
        }

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
        const userIdParam = (await params).userId;
        const body = await req.json();

        // Find user by id (number) or userId (Clerk ID string)
        let user;
        let whereClause;

        if (!isNaN(Number(userIdParam))) {
            // It's a database id
            whereClause = eq(users.id, parseInt(userIdParam));
            user = await db.query.users.findFirst({
                where: whereClause,
            });
        } else {
            // It's a Clerk userId
            whereClause = eq(users.userId, userIdParam);
            user = await db.query.users.findFirst({
                where: whereClause,
            });
        }

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Update user
        const [updatedUser] = await db
            .update(users)
            .set(body)
            .where(whereClause)
            .returning();

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error in PUT /api/users/[userId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
