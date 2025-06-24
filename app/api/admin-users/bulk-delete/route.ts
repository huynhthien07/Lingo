import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { inArray } from "drizzle-orm";

// Admin user IDs that cannot be deleted
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];

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

        console.log(`🗑️ DELETE /api/admin-users/bulk-delete - Request received`);
        console.log("📝 IDs to delete:", ids);

        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id.toString()));

        // Get users to check for admin accounts
        const usersToDelete = await db.select()
            .from(users)
            .where(inArray(users.id, numericIds));

        // Filter out admin accounts
        const nonAdminIds = usersToDelete
            .filter(user => !adminIds.includes(user.userId))
            .map(user => user.id);

        if (nonAdminIds.length === 0) {
            return new NextResponse("No users to delete (admin accounts cannot be deleted)", { status: 400 });
        }

        const deletedUsers = await db.delete(users)
            .where(inArray(users.id, nonAdminIds))
            .returning();

        const adminCount = numericIds.length - nonAdminIds.length;
        console.log(`✅ DELETE /api/admin-users/bulk-delete - ${deletedUsers.length} users deleted successfully (${adminCount} admin accounts skipped)`);
        
        return NextResponse.json({ 
            success: true, 
            deletedCount: deletedUsers.length,
            skippedAdminCount: adminCount,
            deletedUsers 
        });
    } catch (error) {
        console.error("Error bulk deleting users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
