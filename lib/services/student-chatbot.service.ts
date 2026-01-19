/**
 * Student Chatbot Service
 * 
 * Handles chatbot interactions for students
 * - Message processing
 * - Response generation
 * - Feedback collection
 * - Learning history tracking
 */

import { generateResponse } from "./openai-integration.service";

// System prompts for different modes
const SYSTEM_PROMPTS = {
  general: `Bạn là một giáo viên từ vựng và bài tập trắc nghiệm IELTS.
Nhiệm vụ của bạn CHỈ là:
1. Dạy và giải thích các từ vựng tiếng Anh
2. Cung cấp các bài tập trắc nghiệm (4 lựa chọn: A, B, C, D)
3. Kiểm tra câu trả lời và cung cấp giải thích
4. Giúp học sinh cải thiện từ vựng cho IELTS

GIỚI HẠN PHẠM VI - KHÔNG trả lời các câu hỏi về:
- Quy tắc ngữ pháp hoặc giải thích ngữ pháp
- Phát âm hoặc kỹ năng nói
- Kỹ thuật viết hoặc viết bài luận
- Cấu trúc kỳ thi IELTS hoặc chiến lược
- Bất kỳ chủ đề nào không liên quan đến từ vựng hoặc bài tập trắc nghiệm

Nếu học sinh hỏi về các chủ đề ngoài phạm vi, hãy nói lịch sự:
"Xin lỗi, tôi chỉ có thể giúp bạn với từ vựng và các bài tập trắc nghiệm. Vui lòng hỏi về từ vựng hoặc làm bài tập trắc nghiệm."

QUAN TRỌNG: Luôn trả lời bằng tiếng Việt, rõ ràng và thân thiện.`,

  vocabulary: `Bạn là một chuyên gia từ vựng IELTS. Giúp học sinh:
1. Học các từ mới và ý nghĩa của chúng
2. Hiểu cách sử dụng từ và các cụm từ kết hợp
3. Thực hành sử dụng từ trong câu
4. Cải thiện vốn từ vựng cho IELTS

GIỚI HẠN PHẠM VI - KHÔNG trả lời các câu hỏi về:
- Quy tắc ngữ pháp
- Phát âm hoặc kỹ năng nói
- Kỹ thuật viết
- Cấu trúc kỳ thi IELTS
- Bất kỳ chủ đề nào không liên quan đến từ vựng

QUAN TRỌNG: Luôn trả lời bằng tiếng Việt với:
- Định nghĩa rõ ràng
- Ví dụ minh họa
- Cách phát âm (nếu cần)
- Giải thích chi tiết`,

  grammar: `Bạn là một giáo viên từ vựng và bài tập trắc nghiệm IELTS.
Nhiệm vụ của bạn CHỈ là:
1. Dạy và giải thích các từ vựng tiếng Anh
2. Cung cấp các bài tập trắc nghiệm (4 lựa chọn: A, B, C, D)
3. Kiểm tra câu trả lời và cung cấp giải thích

GIỚI HẠN PHẠM VI - KHÔNG trả lời các câu hỏi về:
- Quy tắc ngữ pháp hoặc giải thích ngữ pháp
- Phát âm hoặc kỹ năng nói
- Kỹ thuật viết hoặc viết bài luận
- Cấu trúc kỳ thi IELTS hoặc chiến lược
- Bất kỳ chủ đề nào không liên quan đến từ vựng hoặc bài tập trắc nghiệm

Nếu học sinh hỏi về ngữ pháp, hãy nói lịch sự:
"Xin lỗi, tôi chỉ có thể giúp bạn với từ vựng và các bài tập trắc nghiệm. Vui lòng hỏi về từ vựng hoặc làm bài tập trắc nghiệm."

QUAN TRỌNG: Luôn trả lời bằng tiếng Việt, rõ ràng và thân thiện.`,

  speaking: `Bạn là một giáo viên từ vựng và bài tập trắc nghiệm IELTS.
Nhiệm vụ của bạn CHỈ là:
1. Dạy và giải thích các từ vựng tiếng Anh
2. Cung cấp các bài tập trắc nghiệm (4 lựa chọn: A, B, C, D)
3. Kiểm tra câu trả lời và cung cấp giải thích

GIỚI HẠN PHẠM VI - KHÔNG trả lời các câu hỏi về:
- Phát âm hoặc kỹ năng nói
- Quy tắc ngữ pháp
- Kỹ thuật viết
- Cấu trúc kỳ thi IELTS
- Bất kỳ chủ đề nào không liên quan đến từ vựng hoặc bài tập trắc nghiệm

Nếu học sinh hỏi về kỹ năng nói, hãy nói lịch sự:
"Xin lỗi, tôi chỉ có thể giúp bạn với từ vựng và các bài tập trắc nghiệm. Vui lòng hỏi về từ vựng hoặc làm bài tập trắc nghiệm."

QUAN TRỌNG: Luôn trả lời bằng tiếng Việt, rõ ràng và thân thiện.`,

  writing: `Bạn là một giáo viên từ vựng và bài tập trắc nghiệm IELTS.
Nhiệm vụ của bạn CHỈ là:
1. Dạy và giải thích các từ vựng tiếng Anh
2. Cung cấp các bài tập trắc nghiệm (4 lựa chọn: A, B, C, D)
3. Kiểm tra câu trả lời và cung cấp giải thích

GIỚI HẠN PHẠM VI - KHÔNG trả lời các câu hỏi về:
- Kỹ thuật viết hoặc viết bài luận
- Quy tắc ngữ pháp
- Phát âm hoặc kỹ năng nói
- Cấu trúc kỳ thi IELTS
- Bất kỳ chủ đề nào không liên quan đến từ vựng hoặc bài tập trắc nghiệm

Nếu học sinh hỏi về viết, hãy nói lịch sự:
"Xin lỗi, tôi chỉ có thể giúp bạn với từ vựng và các bài tập trắc nghiệm. Vui lòng hỏi về từ vựng hoặc làm bài tập trắc nghiệm."

QUAN TRỌNG: Luôn trả lời bằng tiếng Việt, rõ ràng và thân thiện.`,
};

interface ChatbotMessage {
  userInput: string;
  mode: keyof typeof SYSTEM_PROMPTS;
  language: "en" | "vi";
}

interface ChatbotResult {
  response: string;
  mode: string;
  confidence: number;
  language: string;
}

/**
 * Process student message and generate response
 */
export async function processChatbotMessage(
  message: ChatbotMessage
): Promise<ChatbotResult> {
  try {
    // Validate input
    if (!message.userInput?.trim()) {
      throw new Error("Message cannot be empty");
    }

    // Get appropriate system prompt
    const systemPrompt = SYSTEM_PROMPTS[message.mode] || SYSTEM_PROMPTS.general;

    // Generate response using OpenAI
    const response = await generateResponse(
      systemPrompt,
      message.userInput,
      {
        temperature: 0.7,
        maxTokens: 1000,
        useFinetuned: true, // Use fine-tuned model if available
      }
    );

    return {
      response,
      mode: message.mode,
      confidence: 0.85, // Default confidence
      language: message.language,
    };
  } catch (error) {
    console.error("Error processing chatbot message:", error);
    throw error;
  }
}

/**
 * Detect mode from user input
 */
export function detectMode(
  userInput: string
): keyof typeof SYSTEM_PROMPTS {
  const input = userInput.toLowerCase();

  if (
    input.includes("vocabulary") ||
    input.includes("word") ||
    input.includes("từ vựng")
  ) {
    return "vocabulary";
  }

  if (
    input.includes("grammar") ||
    input.includes("grammar") ||
    input.includes("ngữ pháp")
  ) {
    return "grammar";
  }

  if (
    input.includes("speaking") ||
    input.includes("speak") ||
    input.includes("nói")
  ) {
    return "speaking";
  }

  if (
    input.includes("writing") ||
    input.includes("write") ||
    input.includes("viết")
  ) {
    return "writing";
  }

  return "general";
}

/**
 * Format response for display
 */
export function formatResponse(response: string): string {
  // Add line breaks for better readability
  return response
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

/**
 * Extract key points from response
 */
export function extractKeyPoints(response: string): string[] {
  const lines = response.split("\n");
  const keyPoints: string[] = [];

  for (const line of lines) {
    if (
      line.startsWith("-") ||
      line.startsWith("•") ||
      line.startsWith("*") ||
      /^\d+\./.test(line)
    ) {
      keyPoints.push(line.replace(/^[-•*\d.]\s*/, "").trim());
    }
  }

  return keyPoints.length > 0 ? keyPoints : [response];
}

