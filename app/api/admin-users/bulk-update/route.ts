import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkUpdateAdminUsers } from "@/lib/controllers/user.controller";

export const PUT = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { ids, data } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid or missing ids array", { status: 400 });
        }

        const numericIds = ids.map(id => parseInt(id.toString()));
        const result = await bulkUpdateAdminUsers(numericIds, data);

        return NextResponse.json({
            success: true,
            updatedCount: result.updatedCount,
            skippedAdminCount: result.skippedAdminCount,
            updatedUsers: result.updatedUsers
        });
    } catch (error) {
        console.error("Error in PUT /api/admin-users/bulk-update:", error);

        if (error instanceof Error) {
            if (error.message.includes("Invalid or missing data")) {
                return new NextResponse(error.message, { status: 400 });
            }
            if (error.message.includes("No users to update") || error.message.includes("No valid fields")) {
                return new NextResponse(error.message, { status: 400 });
            }
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
