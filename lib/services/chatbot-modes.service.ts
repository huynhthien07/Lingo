/**
 * Chatbot Modes Service
 * 
 * Các chế độ hoạt động của chatbot:
 * 1. Multiple Choice - Giải thích câu hỏi trắc nghiệm
 * 2. Vocabulary - Tra cứu từ vựng
 * 3. Grammar - Giải đáp ngữ pháp
 * 4. Error Analysis - Phân tích lỗi sai
 * 5. Personalized - Cá nhân hóa
 * 
 * Nguồn: Mô hình training framework cho IELTS learning platform
 */

import {
  ChatbotRequest,
  MultipleChoiceRequest,
  VocabularyRequest,
  GrammarRequest,
  ErrorAnalysisRequest,
} from "@/lib/types/chatbot.types";

// ============================================================================
// MODE 1: MULTIPLE CHOICE
// ============================================================================

/**
 * Generate system prompt cho Multiple Choice mode
 */
export const getMultipleChoiceSystemPrompt = (): string => {
  return `You are an IELTS exam tutor specializing in explaining multiple-choice questions.

Your role:
1. Explain why the correct answer is right
2. Explain why each incorrect option is wrong
3. Provide relevant vocabulary and grammar points
4. Give examples if needed
5. Keep explanations concise but thorough

Format your response:
- Correct Answer: [explanation]
- Why not A: [explanation]
- Why not B: [explanation]
- Why not C: [explanation]
- Key Learning Point: [main takeaway]

Language: Use the same language as the question (English or Vietnamese)`;
};

/**
 * Format Multiple Choice request to prompt
 */
export const formatMultipleChoicePrompt = (
  request: MultipleChoiceRequest
): string => {
  const optionsText = request.options
    .map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`)
    .join("\n");

  return `Question: ${request.question}

Options:
${optionsText}

User's Answer: ${request.userAnswer}
Correct Answer: ${request.correctAnswer}
${request.context ? `Context: ${request.context}` : ""}

Please explain why the correct answer is right and why the other options are wrong.`;
};

// ============================================================================
// MODE 2: VOCABULARY
// ============================================================================

/**
 * Generate system prompt cho Vocabulary mode
 */
export const getVocabularySystemPrompt = (): string => {
  return `You are an IELTS vocabulary expert.

Your role:
1. Provide clear definition
2. Give pronunciation guide (IPA if possible)
3. Show part of speech
4. Provide 2-3 example sentences
5. List synonyms and antonyms
6. Show common collocations
7. Explain usage in IELTS context

Format your response:
- Definition: [definition]
- Pronunciation: [IPA]
- Part of Speech: [POS]
- Examples: [examples]
- Synonyms: [synonyms]
- Collocations: [collocations]
- IELTS Note: [how it's used in IELTS]

Language: Respond in the requested language (English or Vietnamese)`;
};

/**
 * Format Vocabulary request to prompt
 */
export const formatVocabularyPrompt = (
  request: VocabularyRequest
): string => {
  const contextPart = request.context
    ? `\nContext: "${request.context}"`
    : "";

  return `Word: ${request.word}${contextPart}

Please provide a comprehensive explanation of this word for IELTS learners.`;
};

// ============================================================================
// MODE 3: GRAMMAR
// ============================================================================

/**
 * Generate system prompt cho Grammar mode
 */
export const getGrammarSystemPrompt = (): string => {
  return `You are an IELTS grammar expert.

Your role:
1. Identify the grammar point
2. Explain the rule clearly
3. Provide correct and incorrect examples
4. Show common mistakes Vietnamese learners make
5. Give tips for remembering the rule
6. Show IELTS-relevant usage

Format your response:
- Grammar Point: [name]
- Rule: [explanation]
- Correct: [example]
- Incorrect: [example]
- Common Mistakes: [mistakes]
- Tips: [memory tips]
- IELTS Usage: [how it appears in IELTS]

Language: Respond in the requested language (English or Vietnamese)`;
};

/**
 * Format Grammar request to prompt
 */
export const formatGrammarPrompt = (request: GrammarRequest): string => {
  return `Sentence: "${request.sentence}"

Please analyze this sentence for grammar and provide explanations.`;
};

// ============================================================================
// MODE 4: ERROR ANALYSIS
// ============================================================================

/**
 * Generate system prompt cho Error Analysis mode
 */
export const getErrorAnalysisSystemPrompt = (): string => {
  return `You are an IELTS error analysis expert.

Your role:
1. Identify all errors in the text
2. Categorize errors (grammar, vocabulary, structure)
3. Explain each error
4. Provide corrections
5. Explain why it's wrong
6. Give tips to avoid similar errors

Format your response:
- Error 1: [error type]
  - Incorrect: [text]
  - Correct: [text]
  - Explanation: [why]
  - Tip: [how to avoid]

Language: Respond in the requested language (English or Vietnamese)`;
};

/**
 * Format Error Analysis request to prompt
 */
export const formatErrorAnalysisPrompt = (
  request: ErrorAnalysisRequest
): string => {
  return `Text: "${request.userText}"
Error Type Focus: ${request.errorType}

Please analyze this text for errors and provide detailed explanations.`;
};

// ============================================================================
// MODE 5: PERSONALIZED
// ============================================================================

/**
 * Generate system prompt cho Personalized mode
 */
export const getPersonalizedSystemPrompt = (
  userLevel: "beginner" | "intermediate" | "advanced"
): string => {
  const levelGuidance: Record<string, string> = {
    beginner:
      "Use simple vocabulary and short sentences. Focus on basic concepts.",
    intermediate:
      "Use intermediate vocabulary. Explain concepts with moderate detail.",
    advanced:
      "Use advanced vocabulary. Provide nuanced explanations and edge cases.",
  };

  return `You are a personalized IELTS learning assistant.

User Level: ${userLevel}
${levelGuidance[userLevel]}

Your role:
1. Adapt explanations to user level
2. Use appropriate vocabulary
3. Provide relevant examples
4. Build on previous knowledge
5. Encourage and motivate

Always maintain a supportive and encouraging tone.`;
};

// ============================================================================
// MODE ROUTER
// ============================================================================

/**
 * Route request to appropriate mode handler
 */
export const routeRequest = (
  request: ChatbotRequest
): { systemPrompt: string; userPrompt: string } => {
  switch (request.mode) {
    case "multiple-choice":
      return {
        systemPrompt: getMultipleChoiceSystemPrompt(),
        userPrompt: formatMultipleChoicePrompt(
          request as MultipleChoiceRequest
        ),
      };

    case "vocabulary":
      return {
        systemPrompt: getVocabularySystemPrompt(),
        userPrompt: formatVocabularyPrompt(request as VocabularyRequest),
      };

    case "grammar":
      return {
        systemPrompt: getGrammarSystemPrompt(),
        userPrompt: formatGrammarPrompt(request as GrammarRequest),
      };

    case "error-analysis":
      return {
        systemPrompt: getErrorAnalysisSystemPrompt(),
        userPrompt: formatErrorAnalysisPrompt(
          request as ErrorAnalysisRequest
        ),
      };

    case "personalized":
      return {
        systemPrompt: getPersonalizedSystemPrompt("intermediate"),
        userPrompt: request.mode, // Will be handled separately
      };

    default:
      throw new Error(`Unknown chatbot mode: ${request.mode}`);
  }
};

/**
 * Validate request for mode
 */
export const validateModeRequest = (
  request: ChatbotRequest
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  switch (request.mode) {
    case "multiple-choice":
      const mcReq = request as MultipleChoiceRequest;
      if (!mcReq.question) errors.push("Question is required");
      if (!mcReq.options || mcReq.options.length < 2)
        errors.push("At least 2 options required");
      if (!mcReq.userAnswer) errors.push("User answer is required");
      if (!mcReq.correctAnswer) errors.push("Correct answer is required");
      break;

    case "vocabulary":
      const vocabReq = request as VocabularyRequest;
      if (!vocabReq.word) errors.push("Word is required");
      if (!["en", "vi"].includes(vocabReq.language))
        errors.push("Language must be 'en' or 'vi'");
      break;

    case "grammar":
      const grammarReq = request as GrammarRequest;
      if (!grammarReq.sentence) errors.push("Sentence is required");
      if (!["en", "vi"].includes(grammarReq.language))
        errors.push("Language must be 'en' or 'vi'");
      break;

    case "error-analysis":
      const errorReq = request as ErrorAnalysisRequest;
      if (!errorReq.userText) errors.push("User text is required");
      if (!["grammar", "vocabulary", "structure"].includes(errorReq.errorType))
        errors.push("Invalid error type");
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

