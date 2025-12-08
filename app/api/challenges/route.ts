import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAllChallenges, createChallenge } from "@/lib/controllers/challenge.controller";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const params = {
            question: searchParams.get('question') || undefined,
            type: searchParams.get('type') || undefined,
            lessonId: searchParams.get('lessonId') ? parseInt(searchParams.get('lessonId')!) : undefined,
            page: parseInt(searchParams.get('_page') || '1', 10),
            limit: parseInt(searchParams.get('_limit') || '25', 10),
            sortField: searchParams.get('_sort') || 'order',
            sortOrder: (searchParams.get('_order') || 'asc') as 'asc' | 'desc',
        };

        const result = await getAllChallenges(params);

        const response = NextResponse.json(result.data);
        response.headers.set('x-total-count', result.total.toString());
        return response;
    } catch (error) {
        console.error("Error in GET /api/challenges:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...challengeData } = body;

        const newChallenge = await createChallenge(challengeData);

        return NextResponse.json(newChallenge);
    } catch (error) {
        console.error("Error in POST /api/challenges:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}