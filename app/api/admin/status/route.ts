import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { checkAdminStatus } from "@/lib/controllers/admin.controller";

export const GET = async () => {
    try {
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const status = await checkAdminStatus(userId);

        return NextResponse.json(status);
    } catch (error) {
        console.error("Error in GET /api/admin/status:", error);
        return NextResponse.json({
            error: "Failed to check admin status",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
};
