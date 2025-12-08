import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAllAdminUsers, createAdminUser } from "@/lib/controllers/user.controller";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const params = {
            userName: searchParams.get('userName') || undefined,
            email: searchParams.get('email') || undefined,
            status: searchParams.get('status') || undefined,
            role: searchParams.get('role') || undefined,
            page: parseInt(searchParams.get('_page') || '1'),
            limit: parseInt(searchParams.get('_limit') || '25'),
            sortField: searchParams.get('_sort') || 'createdAt',
            sortOrder: (searchParams.get('_order') || 'DESC').toLowerCase() as 'asc' | 'desc',
        };

        const result = await getAllAdminUsers(params);

        const response = NextResponse.json(result.data);
        response.headers.set('x-total-count', result.total.toString());
        return response;
    } catch (error) {
        console.error("Error in GET /api/admin-users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const newUser = await createAdminUser(body);

        return NextResponse.json(newUser);
    } catch (error) {
        console.error("Error in POST /api/admin-users:", error);

        if (error instanceof Error) {
            if (error.message.includes('required fields')) {
                return new NextResponse(error.message, { status: 400 });
            }
            if (error.message.includes('duplicate key')) {
                return new NextResponse("User with this email or userId already exists", { status: 409 });
            }
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
