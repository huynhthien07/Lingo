/**
 * Admin Analytics API - Language Statistics
 * 
 * Returns language preference statistics:
 * - English users count
 * - Vietnamese users count
 * 
 * Reference: UC36 - Language Pack Management, BR141-BR144
 */

import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
    try {
        // Get English users count
        const enUsersResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.language, "en"));
        const en = enUsersResult[0]?.count || 0;

        // Get Vietnamese users count
        const viUsersResult = await db
            .select({ count: count() })
            .from(users)
            .where(eq(users.language, "vi"));
        const vi = viUsersResult[0]?.count || 0;

        return NextResponse.json({
            en,
            vi,
        });
    } catch (error) {
        console.error("Error fetching language statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch language statistics" },
            { status: 500 }
        );
    }
}

