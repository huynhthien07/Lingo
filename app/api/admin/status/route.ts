import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { auth } from "@clerk/nextjs/server";

export const GET = async () => {
    try {
        const { userId } = await auth();
        const isAdmin = await getIsAdmin();
        
        return NextResponse.json({
            userId,
            isAdmin,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Error checking admin status:", error);
        return NextResponse.json({
            error: "Failed to check admin status",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
};
