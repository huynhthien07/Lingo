import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { inArray } from "drizzle-orm";

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

        console.log(`🗑️ DELETE /api/users/bulk-delete - Request received`);
        console.log("📝 IDs to delete:", ids);

        const deletedUsers = await db.delete(userProgress)
            .where(inArray(userProgress.userId, ids))
            .returning();

        console.log(`✅ DELETE /api/users/bulk-delete - ${deletedUsers.length} user progress records deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            deletedCount: deletedUsers.length,
            deletedUsers 
        });
    } catch (error) {
        console.error("Error bulk deleting user progress:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
