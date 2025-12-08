import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAllChallengeOptions, createChallengeOption } from "@/lib/controllers/challenge-option.controller";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const params = {
            text: searchParams.get('text') || undefined,
            correct: searchParams.get('correct') ? searchParams.get('correct') === 'true' : undefined,
            challengeId: searchParams.get('challengeId') ? parseInt(searchParams.get('challengeId')!) : undefined,
        };

        const data = await getAllChallengeOptions(params);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET /api/challengeOptions:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...challengeOptionData } = body;

        const data = await createChallengeOption(challengeOptionData);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in POST /api/challengeOptions:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}