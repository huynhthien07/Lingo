import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { hasPermission } from "@/lib/services/permission.service";

/**
 * GET /api/auth/check-permission
 * Check if current user has a specific permission
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ hasPermission: false }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const permission = searchParams.get("permission");

    if (!permission) {
      return NextResponse.json(
        { error: "Permission parameter is required" },
        { status: 400 }
      );
    }

    const allowed = await hasPermission(userId, permission);

    return NextResponse.json({ hasPermission: allowed });
  } catch (error) {
    console.error("Error checking permission:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

