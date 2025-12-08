import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserRoleFromDB } from "@/lib/services/permission.service";

/**
 * GET /api/auth/me
 * Get current user info including role
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const role = await getUserRoleFromDB(userId);

    return NextResponse.json({
      userId,
      role,
    });
  } catch (error) {
    console.error("Error getting user info:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

