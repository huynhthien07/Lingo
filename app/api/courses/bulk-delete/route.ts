import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkDeleteCourses } from "@/lib/controllers/course.controller";

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
        const deletedCourses = await bulkDeleteCourses(numericIds);

        return NextResponse.json({
            success: true,
            deletedCount: deletedCourses.length,
            deletedCourses
        });
    } catch (error) {
        console.error("Error in DELETE /api/courses/bulk-delete:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
