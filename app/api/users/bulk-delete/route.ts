import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkDeleteUsers } from "@/lib/controllers/user.controller";

export const DELETE = async (req: Request) => {
    const { userId } = await auth();
    if (!userId || !await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid or missing ids array", { status: 400 });
        }

        const result = await bulkDeleteUsers(userId, ids);

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            skippedCount: result.skippedCount,
            deletedUsers: result.deleted
        });
    } catch (error) {
        console.error("Error in DELETE /api/users/bulk-delete:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
