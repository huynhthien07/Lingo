
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getClerkClient } from "@/lib/services/clerk.service";

/**
 * Test endpoint to change user role
 * GET /api/test-role?role=ADMIN|TEACHER|STUDENT
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get role from query params
    const { searchParams } = new URL(req.url);
    const newRole = searchParams.get("role");

    if (!newRole || !["ADMIN", "TEACHER", "STUDENT"].includes(newRole)) {
      return NextResponse.json(
        { error: "Invalid role. Use ADMIN, TEACHER, or STUDENT" },
        { status: 400 }
      );
    }

    // Update user role in Clerk
    const client = await getClerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        role: newRole,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Role changed to ${newRole}`,
      userId,
      newRole,
      redirectTo: `/${newRole.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error changing role:", error);
    return NextResponse.json(
      { error: "Failed to change role" },
      { status: 500 }
    );
  }
}

