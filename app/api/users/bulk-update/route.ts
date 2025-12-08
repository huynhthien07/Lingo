import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkUpdateUsers } from "@/lib/controllers/user.controller";

export const PUT = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { ids, data } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid ids provided", { status: 400 });
        }

        const result = await bulkUpdateUsers(ids, data);

        return NextResponse.json({
            success: true,
            updated: result.length,
            data: result
        });
    } catch (error) {
        console.error("Error in PUT /api/users/bulk-update:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
