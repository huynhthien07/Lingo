import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getIsAdmin } from "@/lib/admin";
import { db } from "@/lib/services/database.service";
import { users } from "@/db/schema";
import { eq, ilike, or, and, desc, asc } from "drizzle-orm";
import { createClerkUser } from "@/lib/services/clerk.service";

export const GET = async (req: Request) => {
    const { userId } = await auth();

    if (!userId || !await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('_page') || '1', 10);
        const limit = parseInt(searchParams.get('_limit') || '25', 10);
        const sortField = searchParams.get('_sort') || 'createdAt';
        const sortOrder = (searchParams.get('_order') || 'desc') as 'asc' | 'desc';

        // Build filters
        const conditions = [];

        if (searchParams.get('userName')) {
            conditions.push(ilike(users.userName, `%${searchParams.get('userName')}%`));
        }
        if (searchParams.get('email')) {
            conditions.push(ilike(users.email, `%${searchParams.get('email')}%`));
        }
        if (searchParams.get('status')) {
            conditions.push(eq(users.status, searchParams.get('status')!));
        }
        if (searchParams.get('role')) {
            const roleValue = searchParams.get('role')! as "STUDENT" | "TEACHER" | "ADMIN";
            conditions.push(eq(users.role, roleValue));
        }

        // Get total count
        const totalResult = await db
            .select({ count: users.userId })
            .from(users)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        const total = totalResult.length;

        // Get paginated data
        const offset = (page - 1) * limit;
        const orderColumn = sortField === 'id' ? users.userId : users.createdAt;
        const orderFn = sortOrder === 'asc' ? asc : desc;

        const data = await db.query.users.findMany({
            where: conditions.length > 0 ? and(...conditions) : undefined,
            limit,
            offset,
            orderBy: [orderFn(orderColumn)],
        });

        const response = NextResponse.json(data);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error in GET /api/users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const POST = async (req: Request) => {
    const { userId } = await auth();

    if (!userId || !await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        const { userName, email, password, role = "STUDENT" } = body;

        // Validate required fields
        if (!userName || !email || !password) {
            return new NextResponse("userName, email, and password are required", { status: 400 });
        }

        // Create user in Clerk
        const clerkUser = await createClerkUser({
            username: userName,
            email,
            password,
            role,
        });

        // Create user in database
        const [newUser] = await db
            .insert(users)
            .values({
                userId: clerkUser.id,
                userName,
                email,
                role: role as "STUDENT" | "TEACHER" | "ADMIN",
                status: "active",
            })
            .returning();

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: any) {
        console.error("Error in POST /api/users:", error);

        if (error.message?.includes('required')) {
            return new NextResponse(error.message, { status: 400 });
        }

        if (error.errors && error.errors.length > 0) {
            const clerkError = error.errors[0];
            return new NextResponse(clerkError.message || "Error creating user in Clerk", { status: 400 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
