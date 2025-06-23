import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { lessons } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq, inArray } from "drizzle-orm";

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

        // Update multiple lessons
        const result = await db.update(lessons)
            .set(data)
            .where(inArray(lessons.id, ids.map(id => parseInt(id))))
            .returning();

        return NextResponse.json({ 
            success: true, 
            updated: result.length,
            data: result 
        });
    } catch (error) {
        console.error("Error bulk updating lessons:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
