import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getTeacherWritingSubmissions } from "@/lib/controllers/teacher/submission.controller";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const status = searchParams.get("status") || undefined;
    const search = searchParams.get("search") || undefined;

    const result = await getTeacherWritingSubmissions(userId, {
      page,
      limit,
      status,
      search,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching writing submissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch writing submissions" },
      { status: 500 }
    );
  }
}

