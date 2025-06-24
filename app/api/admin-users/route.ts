import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { getIsAdmin } from "@/lib/admin";
import { eq, ilike, and, count, desc, asc } from "drizzle-orm";

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        
        // Pagination parameters
        const page = parseInt(searchParams.get('_page') || '1');
        const limit = parseInt(searchParams.get('_limit') || '25');
        const offset = (page - 1) * limit;

        // Sorting parameters
        const sortField = searchParams.get('_sort') || 'createdAt';
        const sortOrder = searchParams.get('_order') || 'DESC';
        
        // Filter parameters
        const userNameFilter = searchParams.get('userName');
        const emailFilter = searchParams.get('email');
        const statusFilter = searchParams.get('status');
        const roleFilter = searchParams.get('role');

        // Build where conditions
        let whereConditions = [];
        
        if (userNameFilter) {
            whereConditions.push(ilike(users.userName, `%${userNameFilter}%`));
        }
        
        if (emailFilter) {
            whereConditions.push(ilike(users.email, `%${emailFilter}%`));
        }
        
        if (statusFilter) {
            whereConditions.push(eq(users.status, statusFilter));
        }
        
        if (roleFilter) {
            whereConditions.push(eq(users.role, roleFilter));
        }

        const whereCondition = whereConditions.length > 0 ? and(...whereConditions) : undefined;

        // Get total count for pagination
        const totalResult = await db.select({ count: count() })
            .from(users)
            .where(whereCondition);
        const total = totalResult[0]?.count || 0;

        // Determine sort order
        const orderBy = sortOrder.toUpperCase() === 'DESC' 
            ? desc(users[sortField as keyof typeof users] || users.createdAt)
            : asc(users[sortField as keyof typeof users] || users.createdAt);

        // Get paginated data
        const data = await db.select()
            .from(users)
            .where(whereCondition)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        const response = NextResponse.json(data);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching users:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();
        
        // Validate required fields
        if (!body.userId || !body.email || !body.userName) {
            return new NextResponse("Missing required fields: userId, email, userName", { status: 400 });
        }

        const newUser = await db.insert(users).values({
            userId: body.userId,
            email: body.email,
            userName: body.userName,
            userImageSrc: body.userImageSrc || "/mascot.svg",
            status: body.status || "active",
            role: body.role || "user",
            firstName: body.firstName,
            lastName: body.lastName,
            phoneNumber: body.phoneNumber,
            dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
            country: body.country,
            language: body.language || "en",
            timezone: body.timezone,
            lastLoginAt: body.lastLoginAt ? new Date(body.lastLoginAt) : null,
        }).returning();

        return NextResponse.json(newUser[0]);
    } catch (error) {
        console.error("Error creating user:", error);
        if (error instanceof Error && error.message.includes('duplicate key')) {
            return new NextResponse("User with this email or userId already exists", { status: 409 });
        }
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
