import { getIsAdmin } from '@/lib/admin';
import { NextResponse } from 'next/server';
import { getUnitById, updateUnit, deleteUnit } from '@/lib/controllers/unit.controller';

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ unitId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const unitId = parseInt((await params).unitId);
        const unit = await getUnitById(unitId);
        return NextResponse.json(unit);
    } catch (error) {
        console.error("Error in GET /api/units/[unitId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ unitId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const unitId = parseInt((await params).unitId);
        const body = await req.json();
        const updatedUnit = await updateUnit(unitId, body);
        return NextResponse.json(updatedUnit);
    } catch (error) {
        console.error("Error in PUT /api/units/[unitId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ unitId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const unitId = parseInt((await params).unitId);
        const deletedUnit = await deleteUnit(unitId);
        return NextResponse.json(deletedUnit);
    } catch (error) {
        console.error("Error in DELETE /api/units/[unitId]:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};