import { getIsAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';
import { getChallengeOptionById, updateChallengeOption, deleteChallengeOption } from '@/lib/controllers/challenge-option.controller';

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ challengeOptionId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { challengeOptionId } = await params;
        const data = await getChallengeOptionById(parseInt(challengeOptionId));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in GET /api/challengeOptions/[challengeOptionId]:", error);

        if (error instanceof Error && error.message === "Challenge option not found") {
            return new NextResponse("Challenge option not found", { status: 404 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ challengeOptionId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { challengeOptionId } = await params;
        const body = await req.json();
        const data = await updateChallengeOption(parseInt(challengeOptionId), body);

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in PUT /api/challengeOptions/[challengeOptionId]:", error);

        if (error instanceof Error && error.message === "Challenge option not found") {
            return new NextResponse("Challenge option not found", { status: 404 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ challengeOptionId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { challengeOptionId } = await params;
        const data = await deleteChallengeOption(parseInt(challengeOptionId));

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in DELETE /api/challengeOptions/[challengeOptionId]:", error);

        if (error instanceof Error && error.message === "Challenge option not found") {
            return new NextResponse("Challenge option not found", { status: 404 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};