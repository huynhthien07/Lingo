import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { bulkDeleteUsers } from "@/lib/controllers/user.controller";

export const DELETE = async (req: Request) => {
    const { userId } = await auth();

    if (!userId) {
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
            deleted: result.deleted
        });
    } catch (error) {
        console.error("Error in DELETE /api/admin-users/bulk-delete:", error);

        if (error instanceof Error && error.message.includes("permission")) {
            return new NextResponse(error.message, { status: 403 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
