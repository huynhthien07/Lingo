import db from '@/db/drizzle';
import { challenges } from '@/db/schema';
import { getIsAdmin } from '@/lib/admin';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ challengeId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const { challengeId } = await params;
    const data = await db.query.challenges.findFirst({
        where: eq(challenges.id, parseInt(challengeId)),
    });
    return NextResponse.json(data);
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ challengeId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { challengeId } = await params;
    const body = await req.json();
    const data = await db.update(challenges).set({
        ...body,
    }).where(eq(challenges.id, parseInt(challengeId))).returning();

    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ challengeId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const { challengeId } = await params;
    const data = await db.delete(challenges)
        .where(eq(challenges.id, parseInt(challengeId))).returning();

    return NextResponse.json(data[0]);
};