import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";
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

        console.log(`🗑️ DELETE /api/courses/bulk-delete - Request received`);
        console.log("📝 IDs to delete:", ids);

        // Convert string IDs to integers
        const numericIds = ids.map(id => parseInt(id.toString()));

        const deletedCourses = await db.delete(courses)
            .where(inArray(courses.id, numericIds))
            .returning();

        console.log(`✅ DELETE /api/courses/bulk-delete - ${deletedCourses.length} courses deleted successfully`);
        return NextResponse.json({ 
            success: true, 
            deletedCount: deletedCourses.length,
            deletedCourses 
        });
    } catch (error) {
        console.error("Error bulk deleting courses:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
