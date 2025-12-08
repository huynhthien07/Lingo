import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";

// Mock data - same as in route.ts
const MOCK_ROLES = [
    {
        id: "1",
        name: "STUDENT",
        description: "Default role for students. Can access courses, submit assignments, and track progress.",
        permissions: ["course.view", "content.view", "grade.view"],
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
            "course.view", "content.view", "content.create", "content.edit",
            "grade.view", "grade.writing", "grade.speaking", "feedback.create", "analytics.view"
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
            "user.view", "user.create", "user.edit", "user.delete", "user.block", "user.export",
            "course.view", "course.create", "course.edit", "course.delete", "course.publish",
            "content.view", "content.create", "content.edit", "content.delete",
            "grade.view", "grade.writing", "grade.speaking", "feedback.create",
            "analytics.view", "analytics.export", "analytics.dashboard",
            "settings.view", "settings.edit", "role.manage", "language.manage"
        ],
        userCount: 5,
        status: "active",
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
    },
];

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ roleId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const roleId = (await params).roleId;
        const role = MOCK_ROLES.find(r => r.id === roleId);

        if (!role) {
            return new NextResponse("Role not found", { status: 404 });
        }

        return NextResponse.json(role);
    } catch (error) {
        console.error("Error fetching role:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ roleId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const roleId = (await params).roleId;
        const body = await req.json();

        const roleIndex = MOCK_ROLES.findIndex(r => r.id === roleId);

        if (roleIndex === -1) {
            return new NextResponse("Role not found", { status: 404 });
        }

        // Update role
        MOCK_ROLES[roleIndex] = {
            ...MOCK_ROLES[roleIndex],
            name: body.name || MOCK_ROLES[roleIndex].name,
            description: body.description || MOCK_ROLES[roleIndex].description,
            permissions: body.permissions ? JSON.parse(body.permissions) : MOCK_ROLES[roleIndex].permissions,
            status: body.status || MOCK_ROLES[roleIndex].status,
            updatedAt: new Date(),
        };

        return NextResponse.json(MOCK_ROLES[roleIndex]);
    } catch (error) {
        console.error("Error updating role:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ roleId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const roleId = (await params).roleId;

        // Prevent deletion of system roles
        if (["1", "2", "3"].includes(roleId)) {
            return new NextResponse("Cannot delete system roles", { status: 403 });
        }

        const roleIndex = MOCK_ROLES.findIndex(r => r.id === roleId);

        if (roleIndex === -1) {
            return new NextResponse("Role not found", { status: 404 });
        }

        const deletedRole = MOCK_ROLES.splice(roleIndex, 1)[0];

        return NextResponse.json(deletedRole);
    } catch (error) {
        console.error("Error deleting role:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

