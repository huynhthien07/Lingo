import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { trackUserLogin, getUserInfo } from "@/lib/controllers/auth.controller";

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

        const savedUser = await trackUserLogin(userId, user);

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
        console.error("Error in POST /api/auth/login:", error);
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

        const userInfo = await getUserInfo(userId);

        return NextResponse.json({
            exists: true,
            user: userInfo
        });
    } catch (error) {
        console.error("Error in GET /api/auth/login:", error);
        return NextResponse.json({
            exists: false,
            error: "Failed to check user existence"
        }, { status: 500 });
    }
};
