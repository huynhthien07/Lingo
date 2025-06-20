import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getLessonCompletionStatistics } from "@/db/queries";

export const GET = async () => {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const statistics = await getLessonCompletionStatistics();
        return NextResponse.json(statistics);
    } catch (error) {
        console.error("Error fetching lesson completion statistics:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
