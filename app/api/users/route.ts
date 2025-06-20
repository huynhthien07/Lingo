import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";

export const GET = async () => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const data = await db.query.userProgress.findMany({
            with: {
                activeCourse: true,
            },
            orderBy: (userProgress, { desc }) => [desc(userProgress.points)],
        });

        // Map userId to id for React Admin compatibility
        const mappedData = data.map(user => ({
            ...user,
            id: user.userId
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
