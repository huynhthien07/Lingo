import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";
import { getAdminUserById, updateAdminUser, deleteAdminUser } from "@/lib/controllers/user.controller";

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const id = parseInt((await params).id);
        const user = await getAdminUserById(id);

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error in GET /api/admin-users/[id]:", error);

        if (error instanceof Error && error.message === "User not found") {
            return new NextResponse("User not found", { status: 404 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    if (!await getIsAdmin()) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const id = parseInt((await params).id);
        const body = await req.json();

        const updatedUser = await updateAdminUser(id, body);

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error in PUT /api/admin-users/[id]:", error);

        if (error instanceof Error) {
            if (error.message === "User not found") {
                return NextResponse.json({ error: "User not found" }, { status: 404 });
            }
            if (error.message.includes("Cannot block admin account")) {
                return NextResponse.json({ error: error.message }, { status: 403 });
            }
            if (error.message.includes('duplicate key')) {
                return NextResponse.json({ error: "Email already exists" }, { status: 409 });
            }
        }

        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const id = parseInt((await params).id);
        const deletedUser = await deleteAdminUser(id);

        return NextResponse.json(deletedUser);
    } catch (error) {
        console.error("Error in DELETE /api/admin-users/[id]:", error);

        if (error instanceof Error) {
            if (error.message === "User not found") {
                return new NextResponse("User not found", { status: 404 });
            }
            if (error.message.includes("Cannot delete admin account")) {
                return new NextResponse(error.message, { status: 403 });
            }
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
};
