import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { bulkUpdateLessons } from "@/lib/controllers/lesson.controller";

export const PUT = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { ids, data } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("Invalid ids provided", { status: 400 });
        }

        const numericIds = ids.map((id: any) => parseInt(id));
        const result = await bulkUpdateLessons(numericIds, data);

        return NextResponse.json({
            success: true,
            updated: result.length,
            data: result
        });
    } catch (error) {
        console.error("Error in PUT /api/lessons/bulk-update:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
