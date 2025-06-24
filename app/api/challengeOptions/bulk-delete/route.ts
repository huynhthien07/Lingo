import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
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

        console.log(`🗑️ DELETE /api/challengeOptions/bulk-delete - Request received`);
        console.log("📝 IDs to delete:", ids);

        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id.toString()));

        const deletedOptions = await db.delete(challengeOptions)
            .where(inArray(challengeOptions.id, numericIds))
            .returning();

        console.log(`✅ DELETE /api/challengeOptions/bulk-delete - ${deletedOptions.length} challenge options deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            deletedCount: deletedOptions.length,
            deletedOptions 
        });
    } catch (error) {
        console.error("Error bulk deleting challenge options:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
