import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkUpdateUsers } from "@/lib/controllers/user.controller";

export const PUT = async (req: Request) => {
    const { userId } = await auth();
    if (!userId || !await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { ids, data } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid ids provided", { status: 400 });
        }

        const result = await bulkUpdateUsers(userId, ids, data);

        return NextResponse.json({
            success: true,
            updatedCount: result.updatedCount,
            skippedCount: result.skippedCount,
            data: result.updated
        });
    } catch (error) {
        console.error("Error in PUT /api/users/bulk-update:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
