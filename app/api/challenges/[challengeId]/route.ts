import { getIsAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';
import { getChallengeById, updateChallenge, deleteChallenge } from '@/lib/controllers/challenge.controller';

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ challengeId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { challengeId } = await params;
        const challenge = await getChallengeById(parseInt(challengeId));
        return NextResponse.json(challenge);
    } catch (error) {
        console.error("Error in GET /api/challenges/[challengeId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ challengeId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { challengeId } = await params;
        const body = await req.json();
        const updatedChallenge = await updateChallenge(parseInt(challengeId), body);
        return NextResponse.json(updatedChallenge);
    } catch (error) {
        console.error("Error in PUT /api/challenges/[challengeId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ challengeId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { challengeId } = await params;
        const deletedChallenge = await deleteChallenge(parseInt(challengeId));
        return NextResponse.json(deletedChallenge);
    } catch (error) {
        console.error("Error in DELETE /api/challenges/[challengeId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};