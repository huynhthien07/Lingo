import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAllUnits, createUnit } from "@/lib/controllers/unit.controller";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const params = {
            title: searchParams.get('title') || undefined,
            description: searchParams.get('description') || undefined,
            courseId: searchParams.get('courseId') ? parseInt(searchParams.get('courseId')!) : undefined,
            page: parseInt(searchParams.get('_page') || '1', 10),
            limit: parseInt(searchParams.get('_limit') || '25', 10),
            sortField: searchParams.get('_sort') || 'order',
            sortOrder: (searchParams.get('_order') || 'asc') as 'asc' | 'desc',
        };

        const result = await getAllUnits(params);

        const response = NextResponse.json(result.data);
        response.headers.set('x-total-count', result.total.toString());
        return response;
    } catch (error) {
        console.error("Error in GET /api/units:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...unitData } = body;

        const newUnit = await createUnit(unitData);

        return NextResponse.json(newUnit);
    } catch (error) {
        console.error("Error in POST /api/units:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}