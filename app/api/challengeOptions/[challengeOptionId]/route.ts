import db from '@/db/drizzle';
import { challengeOptions } from '@/db/schema';
import { getIsAdmin } from '@/lib/admin';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';


export const GET = async (
    req: Request,
    { params }: { params: Promise<{ challengeOptionId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const { challengeOptionId } = await params;
    const data = await db.query.challengeOptions.findFirst({
        where: eq(challengeOptions.id, parseInt(challengeOptionId)),
    });
    return NextResponse.json(data);
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ challengeOptionId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { challengeOptionId } = await params;
    const body = await req.json();
    const data = await db.update(challengeOptions).set({
        ...body,
    }).where(eq(challengeOptions.id, parseInt(challengeOptionId))).returning();

    return NextResponse.json(data[0]);
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ challengeOptionId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }
    const { challengeOptionId } = await params;
    const data = await db.delete(challengeOptions)
        .where(eq(challengeOptions.id, parseInt(challengeOptionId))).returning();

    return NextResponse.json(data[0]);
};