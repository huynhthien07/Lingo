import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getOverallStatistics } from "@/db/queries";

export const GET = async () => {
    try {
        const isAdmin = await getIsAdmin();
        if (!isAdmin) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const statistics = await getOverallStatistics();
        return NextResponse.json(statistics);
    } catch (error) {
        console.error("Error fetching overall statistics:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
