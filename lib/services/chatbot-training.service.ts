/**
 * Chatbot Training Service
 * 
 * Main service tích hợp toàn bộ training framework
 * Quản lý: Validation → Fine-tuning → Feedback → Improvement
 * 
 * Nguồn: Mô hình training framework cho IELTS learning platform
 */

import OpenAI from "openai";
import {
  ChatbotRequest,
  ChatbotResponse,
  ChatbotMode,
  ValidationResult,
} from "@/lib/types/chatbot.types";
import { validateChatbotOutput } from "./chatbot-validation.service";
import { routeRequest, validateModeRequest } from "./chatbot-modes.service";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ============================================================================
// MAIN CHATBOT RESPONSE GENERATION
// ============================================================================

/**
 * Generate chatbot response with full pipeline
 * Pipeline: Validate Request → Route to Mode → Generate Response → Validate Output
 */
export const generateChatbotResponse = async (
  request: ChatbotRequest,
  userId: string
): Promise<ChatbotResponse> => {
  const responseId = `response_${Date.now()}`;

  try {
    // Step 1: Validate request
    const requestValidation = validateModeRequest(request);
    if (!requestValidation.isValid) {
      throw new Error(
        `Invalid request: ${requestValidation.errors.join(", ")}`
      );
    }

    // Step 2: Route to appropriate mode
    const { systemPrompt, userPrompt } = routeRequest(request);

    // Step 3: Generate response from OpenAI
    const aiResponse = await generateAIResponse(systemPrompt, userPrompt);

    // Step 4: Validate output
    const language = "language" in request ? request.language : "en";
    const validationResult = validateChatbotOutput(
      aiResponse,
      request.mode,
      language
    );

    // Step 5: If validation fails, try to improve response
    let finalResponse = aiResponse;
    if (!validationResult.isValid) {
      finalResponse = await improveResponse(
        aiResponse,
        validationResult,
        systemPrompt
      );
    }

    // Step 6: Create response object
    const response: ChatbotResponse = {
      id: responseId,
      mode: request.mode,
      userInput:
        "question" in request
          ? request.question
          : "word" in request
            ? request.word
            : "sentence" in request
              ? request.sentence
              : "userText" in request
                ? request.userText
                : "",
      response: finalResponse,
      confidence: calculateConfidence(validationResult),
      validationResult,
      language,
      createdAt: new Date(),
    };

    return response;
  } catch (error) {
    console.error("Error generating chatbot response:", error);
    throw error;
  }
};

/**
 * Generate AI response using OpenAI
 */
const generateAIResponse = async (
  systemPrompt: string,
  userPrompt: string
): Promise<string> => {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || "";
};

/**
 * Improve response if validation fails
 */
const improveResponse = async (
  originalResponse: string,
  validationResult: ValidationResult,
  systemPrompt: string
): Promise<string> => {
  const improvementPrompt = `
The previous response had the following issues:
${validationResult.warnings.join("\n")}

Suggestions for improvement:
${validationResult.suggestions.join("\n")}

Please provide an improved version of the response that addresses these issues.

Original response:
${originalResponse}

Improved response:`;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: improvementPrompt },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  return response.choices[0].message.content || originalResponse;
};

/**
 * Calculate confidence score
 */
const calculateConfidence = (validationResult: ValidationResult): number => {
  // Confidence = validation score / 100
  return Math.min(1, validationResult.score / 100);
};

// ============================================================================
// BATCH RESPONSE GENERATION
// ============================================================================

/**
 * Generate multiple responses (for testing/evaluation)
 */
export const generateBatchResponses = async (
  requests: ChatbotRequest[],
  userId: string
): Promise<ChatbotResponse[]> => {
  const responses: ChatbotResponse[] = [];

  for (const request of requests) {
    try {
      const response = await generateChatbotResponse(request, userId);
      responses.push(response);
    } catch (error) {
      console.error(`Error processing request:`, error);
    }
  }

  return responses;
};

// ============================================================================
// RESPONSE EVALUATION
// ============================================================================

/**
 * Evaluate response quality
 */
export const evaluateResponse = (
  response: ChatbotResponse
): {
  quality: "excellent" | "good" | "fair" | "poor";
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  // Check validation
  if (response.validationResult.isValid) {
    score += 40;
    feedback.push("✅ Passed all validation checks");
  } else {
    feedback.push("❌ Failed validation checks");
  }

  // Check confidence
  if (response.confidence >= 0.9) {
    score += 30;
    feedback.push("✅ High confidence response");
  } else if (response.confidence >= 0.7) {
    score += 20;
    feedback.push("⚠️ Moderate confidence response");
  } else {
    feedback.push("❌ Low confidence response");
  }

  // Check response length
  if (response.response.length >= 100 && response.response.length <= 1000) {
    score += 20;
    feedback.push("✅ Appropriate response length");
  } else {
    feedback.push("⚠️ Response length could be improved");
  }

  // Check for examples
  if (
    response.response.toLowerCase().includes("example") ||
    response.response.toLowerCase().includes("e.g.")
  ) {
    score += 10;
    feedback.push("✅ Includes examples");
  }

  // Determine quality
  let quality: "excellent" | "good" | "fair" | "poor";
  if (score >= 90) quality = "excellent";
  else if (score >= 70) quality = "good";
  else if (score >= 50) quality = "fair";
  else quality = "poor";

  return { quality, score, feedback };
};

// ============================================================================
// RESPONSE LOGGING
// ============================================================================

/**
 * Log response for analysis
 */
export const logResponse = (
  response: ChatbotResponse,
  userId: string
): void => {
  const log = {
    timestamp: new Date().toISOString(),
    userId,
    responseId: response.id,
    mode: response.mode,
    confidence: response.confidence,
    isValid: response.validationResult.isValid,
    validationScore: response.validationResult.score,
  };

  console.log("[CHATBOT RESPONSE LOG]", JSON.stringify(log, null, 2));
};

