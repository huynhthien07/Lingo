/**
 * Chatbot Feedback API Endpoint
 * 
 * POST /api/chatbot/feedback - Submit feedback
 * GET /api/chatbot/feedback - Get feedback analytics
 * 
 * Endpoint để thu thập và phân tích phản hồi người dùng
 * Nguồn: Mô hình training framework cho IELTS learning platform
 */

import { NextRequest, NextResponse } from "next/server";
import {
  createUserFeedback,
  validateFeedback,
  aggregateFeedback,
  generateFeedbackInsights,
  shouldRetrain,
  createTrainingExamplesFromFeedback,
} from "@/lib/services/chatbot-feedback.service";
import { UserFeedback } from "@/lib/types/chatbot.types";

// Mock storage - trong thực tế sẽ lưu vào database
const feedbackStore: Map<string, UserFeedback[]> = new Map();

export async function POST(req: NextRequest) {
  try {
    const { userId, chatbotResponseId, rating, category, comment, suggestedCorrection } = await req.json();

    if (!userId || !chatbotResponseId || !rating || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create feedback
    const feedback = createUserFeedback(
      userId,
      chatbotResponseId,
      rating,
      category,
      { comment, suggestedCorrection }
    );

    // Validate feedback
    const validation = validateFeedback(feedback);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: "Invalid feedback", errors: validation.errors },
        { status: 400 }
      );
    }

    // Store feedback
    const userFeedbacks = feedbackStore.get(userId) || [];
    userFeedbacks.push(feedback);
    feedbackStore.set(userId, userFeedbacks);

    return NextResponse.json({
      success: true,
      feedbackId: feedback.id,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const userFeedbacks = feedbackStore.get(userId) || [];

    if (action === "analytics") {
      // Get feedback analytics
      const aggregation = aggregateFeedback(userFeedbacks);
      const insights = generateFeedbackInsights(aggregation);
      const needsRetrain = shouldRetrain(aggregation);

      return NextResponse.json({
        success: true,
        analytics: {
          totalFeedback: aggregation.totalFeedback,
          averageRating: aggregation.averageRating,
          helpfulPercentage: aggregation.helpfulPercentage,
          commonIssues: aggregation.commonIssues,
          suggestedImprovements: aggregation.suggestedImprovements,
        },
        insights,
        needsRetrain,
      });
    }

    if (action === "training-examples") {
      // Generate training examples from feedback
      const originalResponses = new Map(); // Would be populated from database
      const trainingExamples = createTrainingExamplesFromFeedback(
        userFeedbacks,
        originalResponses
      );

      return NextResponse.json({
        success: true,
        trainingExamples: trainingExamples.map((ex) => ({
          id: ex.id,
          input: ex.input,
          expectedOutput: ex.expectedOutput,
          category: ex.category,
          difficulty: ex.difficulty,
          tags: ex.tags,
        })),
        count: trainingExamples.length,
      });
    }

    // Default: return all feedback
    return NextResponse.json({
      success: true,
      feedbacks: userFeedbacks.map((f) => ({
        id: f.id,
        rating: f.rating,
        isHelpful: f.isHelpful,
        comment: f.comment,
        category: f.category,
        createdAt: f.createdAt,
      })),
      count: userFeedbacks.length,
    });
  } catch (error) {
    console.error("Feedback retrieval error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve feedback" },
      { status: 500 }
    );
  }
}

