import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkDeleteAdminUsers } from "@/lib/controllers/user.controller";

export const DELETE = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { ids } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid or missing ids array", { status: 400 });
        }

        const numericIds = ids.map(id => parseInt(id.toString()));
        const result = await bulkDeleteAdminUsers(numericIds);

        return NextResponse.json({
            success: true,
            deletedCount: result.deletedCount,
            skippedAdminCount: result.skippedAdminCount,
            deletedUsers: result.deletedUsers
        });
    } catch (error) {
        console.error("Error in DELETE /api/admin-users/bulk-delete:", error);

        if (error instanceof Error && error.message.includes("No users to delete")) {
            return new NextResponse(error.message, { status: 400 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
