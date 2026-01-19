/**
 * Course Recommendations API
 * GET /api/recommendations - Get course recommendations based on admission test
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { RecommendationEngine } from "@/lib/services/recommendation.service";

/**
 * GET /api/recommendations?attemptId=123&userGoal=IELTS
 * Get course recommendations based on admission test results
 */
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    const searchParams = req.nextUrl.searchParams;
    const attemptId = searchParams.get("attemptId");
    const userGoal = searchParams.get("userGoal") || undefined;

    if (!attemptId) {
      return NextResponse.json(
        { error: "attemptId is required" },
        { status: 400 }
      );
    }

    const attemptIdNum = parseInt(attemptId);
    if (isNaN(attemptIdNum)) {
      return NextResponse.json(
        { error: "Invalid attemptId" },
        { status: 400 }
      );
    }

    // Get recommendations
    const recommendations = await RecommendationEngine.getRecommendations(
      attemptIdNum,
      userGoal
    );

    // Save recommendations to database if user is authenticated
    if (recommendations.length > 0 && userId) {
      await RecommendationEngine.saveRecommendations(userId, recommendations);
    }

    return NextResponse.json({
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("Error getting recommendations:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}

