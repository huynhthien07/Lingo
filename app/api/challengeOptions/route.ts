import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const textFilter = searchParams.get('text');
        const correctFilter = searchParams.get('correct');
        const challengeIdFilter = searchParams.get('challengeId');

        let data;
        if (textFilter || correctFilter || challengeIdFilter) {
            data = await db.query.challengeOptions.findMany({
                where: (challengeOptions, { ilike, eq, and }) => {
                    const conditions = [];
                    if (textFilter) {
                        conditions.push(ilike(challengeOptions.text, `%${textFilter}%`));
                    }
                    if (correctFilter) {
                        conditions.push(eq(challengeOptions.correct, correctFilter === 'true'));
                    }
                    if (challengeIdFilter) {
                        conditions.push(eq(challengeOptions.challengeId, parseInt(challengeIdFilter)));
                    }
                    return conditions.length > 1 ? and(...conditions) : conditions[0];
                }
            });
        } else {
            data = await db.query.challengeOptions.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching challenge options:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Remove id from body to let database auto-generate it
    const { id, ...challengeOptionData } = body;

    const data = await db.insert(challengeOptions).values({
        ...challengeOptionData,
    }).returning();

    return NextResponse.json(data[0]);
}