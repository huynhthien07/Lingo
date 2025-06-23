import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
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

        // Update multiple users
        const result = await db.update(userProgress)
            .set(data)
            .where(inArray(userProgress.userId, ids))
            .returning();

        return NextResponse.json({ 
            success: true, 
            updated: result.length,
            data: result 
        });
    } catch (error) {
        console.error("Error bulk updating users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
