import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { units } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const titleFilter = searchParams.get('title');
        const descriptionFilter = searchParams.get('description');
        const courseIdFilter = searchParams.get('courseId');

        let data;
        if (titleFilter || descriptionFilter || courseIdFilter) {
            data = await db.query.units.findMany({
                where: (units, { ilike, eq, and }) => {
                    const conditions = [];
                    if (titleFilter) {
                        conditions.push(ilike(units.title, `%${titleFilter}%`));
                    }
                    if (descriptionFilter) {
                        conditions.push(ilike(units.description, `%${descriptionFilter}%`));
                    }
                    if (courseIdFilter) {
                        conditions.push(eq(units.courseId, parseInt(courseIdFilter)));
                    }
                    return conditions.length > 1 ? and(...conditions) : conditions[0];
                }
            });
        } else {
            data = await db.query.units.findMany();
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching units:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    // Remove id from body to let database auto-generate it
    const { id, ...unitData } = body;

    const data = await db.insert(units).values({
        ...unitData,
    }).returning();

    return NextResponse.json(data[0]);
}