import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { challengeOptions } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.challengeOptions.findMany();
    return NextResponse.json(data);
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