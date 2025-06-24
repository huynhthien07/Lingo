import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq, inArray } from "drizzle-orm";

// Admin user IDs that cannot be blocked
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];

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

        if (!data || typeof data !== 'object') {
            return new NextResponse("Invalid or missing data object", { status: 400 });
        }

        console.log(`🔄 PUT /api/admin-users/bulk-update - Request received`);
        console.log("📝 IDs:", ids);
        console.log("📝 Data:", JSON.stringify(data, null, 2));

        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id.toString()));

        // If trying to block users, check for admin accounts
        if ('status' in data && data.status === 'blocked') {
            // Get users to check for admin accounts
            const usersToUpdate = await db.select()
                .from(users)
                .where(inArray(users.id, numericIds));

            // Filter out admin accounts
            const nonAdminIds = usersToUpdate
                .filter(user => !adminIds.includes(user.userId))
                .map(user => user.id);

            if (nonAdminIds.length === 0) {
                return new NextResponse("No users to update (admin accounts cannot be blocked)", { status: 400 });
            }

            // Update only non-admin users
            const updateData: any = {
                ...data,
                updatedAt: new Date(),
            };

            const updatedUsers = await db.update(users)
                .set(updateData)
                .where(inArray(users.id, nonAdminIds))
                .returning();

            const adminCount = numericIds.length - nonAdminIds.length;
            console.log(`✅ PUT /api/admin-users/bulk-update - ${updatedUsers.length} users updated successfully (${adminCount} admin accounts skipped)`);
            
            return NextResponse.json({ 
                success: true, 
                updatedCount: updatedUsers.length,
                skippedAdminCount: adminCount,
                updatedUsers 
            });
        } else {
            // For non-blocking operations, update all users
            const allowedFields = ['status', 'role'];
            const updateData: any = {
                updatedAt: new Date(),
            };

            for (const field of allowedFields) {
                if (field in data) {
                    updateData[field] = data[field];
                }
            }

            if (Object.keys(updateData).length === 1) { // Only updatedAt
                return new NextResponse("No valid fields to update", { status: 400 });
            }

            console.log("📝 Update data:", JSON.stringify(updateData, null, 2));

            const updatedUsers = await db.update(users)
                .set(updateData)
                .where(inArray(users.id, numericIds))
                .returning();

            console.log(`✅ PUT /api/admin-users/bulk-update - ${updatedUsers.length} users updated successfully`);
            return NextResponse.json({ 
                success: true, 
                updatedCount: updatedUsers.length,
                updatedUsers 
            });
        }
    } catch (error) {
        console.error("Error bulk updating users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
