import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq } from "drizzle-orm";

// Admin user IDs that cannot be blocked
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const id = parseInt((await params).id);

        const data = await db.select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!data || data.length === 0) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error fetching user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const id = parseInt((await params).id);
        const body = await req.json();

        console.log(`🔄 PUT /api/admin-users/${id} - Request received`);
        console.log("📝 Request body:", JSON.stringify(body, null, 2));

        // Get current user to check if it's an admin
        const currentUser = await db.select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!currentUser || currentUser.length === 0) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Check if trying to block an admin account
        if ('status' in body && body.status === 'blocked' && adminIds.includes(currentUser[0].userId)) {
            console.log(`❌ Attempt to block admin account: ${currentUser[0].userId}`);
            return new NextResponse("Cannot block admin account", { status: 403 });
        }

        // Only allow updating specific fields for security
        const allowedFields = ['userName', 'userImageSrc', 'status', 'role', 'email', 'firstName', 'lastName', 'phoneNumber', 'dateOfBirth', 'country', 'language', 'timezone', 'lastLoginAt'];
        const updateData: any = {
            updatedAt: new Date(),
        };

        for (const field of allowedFields) {
            if (field in body) {
                if ((field === 'lastLoginAt' || field === 'dateOfBirth') && body[field]) {
                    updateData[field] = new Date(body[field]);
                } else {
                    updateData[field] = body[field];
                }
            }
        }

        console.log("📝 Update data:", JSON.stringify(updateData, null, 2));

        const updatedUser = await db.update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning();

        if (!updatedUser || updatedUser.length === 0) {
            return new NextResponse("User not found", { status: 404 });
        }

        console.log(`✅ PUT /api/admin-users/${id} - User updated successfully`);
        return NextResponse.json(updatedUser[0]);
    } catch (error) {
        console.error("Error updating user:", error);
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return new NextResponse("Email already exists", { status: 409 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const id = parseInt((await params).id);

        // Get current user to check if it's an admin
        const currentUser = await db.select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!currentUser || currentUser.length === 0) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Prevent deletion of admin accounts
        if (adminIds.includes(currentUser[0].userId)) {
            return new NextResponse("Cannot delete admin account", { status: 403 });
        }

        const deletedUser = await db.delete(users)
            .where(eq(users.id, id))
            .returning();

        if (!deletedUser || deletedUser.length === 0) {
            return new NextResponse("User not found", { status: 404 });
        }

        return NextResponse.json(deletedUser[0]);
    } catch (error) {
        console.error("Error deleting user:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
