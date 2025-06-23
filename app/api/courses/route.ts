import { NextResponse } from "next/server";

import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const data = await db.query.courses.findMany();
    return NextResponse.json(data);
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        console.log("Received course data:", body);

        // Remove id from body to let database auto-generate it
        const { id, ...courseData } = body;
        console.log("Course data after removing id:", courseData);

        const data = await db.insert(courses).values({
            ...courseData,
        }).returning();

        return NextResponse.json(data[0]);
    } catch (error) {
        console.error("Error creating course:", error);

        // Check if it's a duplicate key error
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return new NextResponse("Course with this ID already exists. Please try again.", { status: 409 });
        }

        return new NextResponse("Failed to create course", { status: 500 });
    }
}