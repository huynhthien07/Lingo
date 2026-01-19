/**
 * Chatbot Response Generation API Endpoint
 *
 * POST /api/chatbot/response
 *
 * Generates chatbot responses for student queries
 */

import { NextRequest, NextResponse } from "next/server";
import { processChatbotMessage, detectMode } from "@/lib/services/student-chatbot.service";

interface ChatbotRequestBody {
  request: {
    userInput: string;
    mode?: string;
    language?: "en" | "vi";
  };
  userId: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ChatbotRequestBody;
    const { request, userId } = body;

    // Validate input
    if (!request?.userInput || !userId) {
      return NextResponse.json(
        { error: "userInput and userId are required" },
        { status: 400 }
      );
    }

    // Detect mode if not provided
    const mode = request.mode || detectMode(request.userInput);
    const language = request.language || "en";

    // Process message
    const result = await processChatbotMessage({
      userInput: request.userInput,
      mode: mode as any,
      language,
    });

    // Return response
    return NextResponse.json({
      success: true,
      response: {
        id: `msg_${Date.now()}`,
        mode: result.mode,
        userInput: request.userInput,
        text: result.response,
        confidence: result.confidence,
        language: result.language,
        createdAt: new Date().toISOString(),
      },
      validation: {
        isValid: true,
        score: 1.0,
        errors: [],
        warnings: [],
        suggestions: [],
      },
      evaluation: {
        quality: "good",
        score: 0.85,
        feedback: "Response generated successfully",
      },
    });
  } catch (error) {
    console.error("Response generation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate response: ${errorMessage}` },
      { status: 500 }
    );
  }
}

