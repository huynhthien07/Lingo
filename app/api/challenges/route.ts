import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { challenges } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const questionFilter = searchParams.get('question');
        const typeFilter = searchParams.get('type');
        const lessonIdFilter = searchParams.get('lessonId');

        let data;
        if (questionFilter || typeFilter || lessonIdFilter) {
            data = await db.query.challenges.findMany({
                where: (challenges, { ilike, eq, and }) => {
                    const conditions = [];
                    if (questionFilter) {
                        conditions.push(ilike(challenges.question, `%${questionFilter}%`));
                    }
                    if (typeFilter) {
                        conditions.push(eq(challenges.type, typeFilter as any));
                    }
                    if (lessonIdFilter) {
                        conditions.push(eq(challenges.lessonId, parseInt(lessonIdFilter)));
                    }
                    return conditions.length > 1 ? and(...conditions) : conditions[0];
                }
            });
        } else {
            data = await db.query.challenges.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching challenges:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Remove id from body to let database auto-generate it
    const { id, ...challengeData } = body;

    const data = await db.insert(challenges).values({
        ...challengeData,
    }).returning();

    return NextResponse.json(data[0]);
}