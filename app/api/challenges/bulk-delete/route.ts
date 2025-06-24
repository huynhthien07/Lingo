import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
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

        console.log(`🗑️ DELETE /api/challenges/bulk-delete - Request received`);
        console.log("📝 IDs to delete:", ids);

        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id.toString()));

        const deletedChallenges = await db.delete(challenges)
            .where(inArray(challenges.id, numericIds))
            .returning();

        console.log(`✅ DELETE /api/challenges/bulk-delete - ${deletedChallenges.length} challenges deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            deletedCount: deletedChallenges.length,
            deletedChallenges 
        });
    } catch (error) {
        console.error("Error bulk deleting challenges:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
