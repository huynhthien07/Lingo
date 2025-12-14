import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getTests, createTest } from "@/lib/controllers/teacher/test.controller";

// GET /api/teacher/tests - Get all tests with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || undefined;
    const testType = searchParams.get("testType") || undefined;
    const examType = searchParams.get("examType") || undefined;

    const result = await getTests({
      page,
      limit,
      search,
      testType,
      examType,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching tests:", error);
    return NextResponse.json(
      { error: "Failed to fetch tests" },
      { status: 500 }
    );
  }
}

// POST /api/teacher/tests - Create new test
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const newTest = await createTest({
      title: body.title,
      description: body.description,
      imageSrc: body.imageSrc,
      testType: body.testType,
      examType: body.examType,
      duration: body.duration,
      createdBy: userId,
    });

    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: "Failed to create test" },
      { status: 500 }
    );
  }
}

