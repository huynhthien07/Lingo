import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";

// Mock data for roles - Only 3 roles used in the system
const MOCK_ROLES = [
    {
        id: "1",
        name: "STUDENT",
        description: "Default role for students. Can access courses, submit assignments, and track progress.",
        permissions: [
            "course.view",
            "content.view",
            "grade.view",
        ],
        userCount: 150,
        status: "active",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
    },
    {
        id: "2",
        name: "TEACHER",
        description: "Role for teachers. Can grade assignments, provide feedback, and manage assigned courses.",
        permissions: [
            "course.view",
            "content.view",
            "content.create",
            "content.edit",
            "grade.view",
            "grade.writing",
            "grade.speaking",
            "feedback.create",
            "analytics.view",
        ],
        userCount: 25,
        status: "active",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
    },
    {
        id: "3",
        name: "ADMIN",
        description: "Full system administrator with all permissions.",
        permissions: [
            "user.view",
            "user.create",
            "user.edit",
            "user.delete",
            "user.block",
            "user.export",
            "course.view",
            "course.create",
            "course.edit",
            "course.delete",
            "course.publish",
            "content.view",
            "content.create",
            "content.edit",
            "content.delete",
            "grade.view",
            "grade.writing",
            "grade.speaking",
            "feedback.create",
            "analytics.view",
            "analytics.export",
            "analytics.dashboard",
            "settings.view",
            "settings.edit",
            "role.manage",
            "language.manage",
        ],
        userCount: 5,
        status: "active",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
    },
];

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('_page') || '1', 10);
        const limit = parseInt(searchParams.get('_limit') || '25', 10);
        const offset = (page - 1) * limit;

        // Filter by search query
        const searchQuery = searchParams.get('q');
        let filteredRoles = MOCK_ROLES;

        if (searchQuery) {
            filteredRoles = MOCK_ROLES.filter(role =>
                role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                role.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const total = filteredRoles.length;
        const paginatedRoles = filteredRoles.slice(offset, offset + limit);

        const response = NextResponse.json(paginatedRoles);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching roles:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();

        // In production, save to database
        const newRole = {
            id: String(MOCK_ROLES.length + 1),
            name: body.name,
            description: body.description,
            permissions: JSON.parse(body.permissions || "[]"),
            userCount: 0,
            status: body.status || "active",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        MOCK_ROLES.push(newRole);

        return NextResponse.json(newRole);
    } catch (error) {
        console.error("Error creating role:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

