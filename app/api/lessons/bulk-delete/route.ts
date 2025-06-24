import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
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

        console.log(`🗑️ DELETE /api/lessons/bulk-delete - Request received`);
        console.log("📝 IDs to delete:", ids);

        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id.toString()));

        const deletedLessons = await db.delete(lessons)
            .where(inArray(lessons.id, numericIds))
            .returning();

        console.log(`✅ DELETE /api/lessons/bulk-delete - ${deletedLessons.length} lessons deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            deletedCount: deletedLessons.length,
            deletedLessons 
        });
    } catch (error) {
        console.error("Error bulk deleting lessons:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
