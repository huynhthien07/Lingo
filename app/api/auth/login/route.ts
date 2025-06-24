import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { upsertUserToUsersTable } from "@/lib/user-management";

/**
 * API endpoint to handle user login tracking
 * This can be called from the frontend to ensure user data is saved to the users table
 */
export const POST = async () => {
    try {
        const { userId } = await auth();
        const user = await currentUser();

        if (!userId || !user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Save/update user information in the users table
        const savedUser = await upsertUserToUsersTable();

        console.log(`✅ User login tracked: ${savedUser.userName} (${savedUser.email})`);

        return NextResponse.json({
            success: true,
            message: "User login tracked successfully",
            user: {
                id: savedUser.id,
                userId: savedUser.userId,
                userName: savedUser.userName,
                email: savedUser.email,
                status: savedUser.status,
                role: savedUser.role,
                lastLoginAt: savedUser.lastLoginAt,
            }
        });
    } catch (error) {
        console.error("Error tracking user login:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

/**
 * GET endpoint to check if user exists in users table
 */
export const GET = async () => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // Check if user exists and get their info
        const savedUser = await upsertUserToUsersTable();

        return NextResponse.json({
            exists: true,
            user: {
                id: savedUser.id,
                userId: savedUser.userId,
                userName: savedUser.userName,
                email: savedUser.email,
                status: savedUser.status,
                role: savedUser.role,
                lastLoginAt: savedUser.lastLoginAt,
            }
        });
    } catch (error) {
        console.error("Error checking user existence:", error);
        return NextResponse.json({
            exists: false,
            error: "Failed to check user existence"
        }, { status: 500 });
    }
};
