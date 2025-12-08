/**
 * Admin Analytics API - System Statistics
 * 
 * Returns system configuration statistics:
 * - Total language packs count
 * - Supported languages count
 * 
 * Reference: UC36 - Language Pack Management, BR141-BR144
 */

import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { languagePacks } from "@/db/schema";
import { count, sql } from "drizzle-orm";

export async function GET() {
    try {
        // Get total language packs count
        const totalPacksResult = await db
            .select({ count: count() })
            .from(languagePacks);
        const totalLanguagePacks = totalPacksResult[0]?.count || 0;

        // Get supported languages count (distinct locales)
        const supportedLanguagesResult = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${languagePacks.locale})` })
            .from(languagePacks);
        const supportedLanguages = supportedLanguagesResult[0]?.count || 2; // Default: en, vi

        return NextResponse.json({
            totalLanguagePacks,
            supportedLanguages,
        });
    } catch (error) {
        console.error("Error fetching system statistics:", error);
        return NextResponse.json(
            { error: "Failed to fetch system statistics" },
            { status: 500 }
        );
    }
}

