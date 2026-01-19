/**
 * Chatbot Output Validation Service
 * 
 * Kiểm soát đầu ra (Output Control) - Đảm bảo chatbot chỉ trả lời trong phạm vi
 * Nguồn: Mô hình training framework cho IELTS learning platform
 * 
 * Các kiểm tra:
 * 1. Scope validation - Kiểm tra câu trả lời có nằm trong phạm vi IELTS không
 * 2. Language validation - Kiểm tra ngôn ngữ (chỉ Tiếng Anh hoặc Tiếng Việt)
 * 3. Quality validation - Kiểm tra chất lượng (có giải thích "tại sao" không)
 * 4. Content validation - Kiểm tra nội dung không phù hợp
 */

import {
  ValidationResult,
  ValidationError,
  ValidationRule,
  ChatbotMode,
} from "@/lib/types/chatbot.types";

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * IELTS Scope Keywords - Từ khóa để xác định câu trả lời có nằm trong phạm vi IELTS
 */
const IELTS_SCOPE_KEYWORDS = [
  "IELTS",
  "reading",
  "listening",
  "writing",
  "speaking",
  "band",
  "score",
  "vocabulary",
  "grammar",
  "pronunciation",
  "collocation",
  "phrasal verb",
  "academic",
  "general training",
];

/**
 * Out-of-scope keywords - Từ khóa chỉ ra câu trả lời vượt ngoài phạm vi
 */
const OUT_OF_SCOPE_KEYWORDS = [
  "politics",
  "religion",
  "adult content",
  "violence",
  "illegal",
  "hack",
  "crack",
  "piracy",
];

/**
 * Supported languages
 */
const SUPPORTED_LANGUAGES = ["en", "vi"];

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS = {
  vi: /[\u0100-\u01FF\u1E00-\u1EFF]/g, // Vietnamese characters
  en: /[a-zA-Z]/g,
};

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Kiểm tra phạm vi IELTS
 */
export const validateScope = (
  output: string,
  mode: ChatbotMode
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const lowerOutput = output.toLowerCase();

  // Kiểm tra nội dung không phù hợp
  for (const keyword of OUT_OF_SCOPE_KEYWORDS) {
    if (lowerOutput.includes(keyword.toLowerCase())) {
      errors.push({
        type: "scope",
        message: `Output contains out-of-scope content: "${keyword}"`,
        severity: "error",
      });
    }
  }

  // Kiểm tra câu trả lời có liên quan đến IELTS không
  const hasIELTSContext = IELTS_SCOPE_KEYWORDS.some((keyword) =>
    lowerOutput.includes(keyword.toLowerCase())
  );

  if (!hasIELTSContext && mode !== "personalized") {
    errors.push({
      type: "scope",
      message: "Output may not be related to IELTS learning context",
      severity: "warning",
    });
  }

  return errors;
};

/**
 * Kiểm tra ngôn ngữ
 */
export const validateLanguage = (output: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Detect language
  const viChars = (output.match(LANGUAGE_PATTERNS.vi) || []).length;
  const enChars = (output.match(LANGUAGE_PATTERNS.en) || []).length;

  const totalChars = viChars + enChars;
  if (totalChars === 0) {
    errors.push({
      type: "language",
      message: "Output contains no recognizable language",
      severity: "error",
    });
    return errors;
  }

  const viPercentage = viChars / totalChars;
  const enPercentage = enChars / totalChars;

  // Kiểm tra ngôn ngữ hỗn hợp (nếu cả hai > 20%)
  if (viPercentage > 0.2 && enPercentage > 0.2) {
    errors.push({
      type: "language",
      message: "Output mixes Vietnamese and English excessively",
      severity: "warning",
    });
  }

  return errors;
};

/**
 * Kiểm tra chất lượng (có giải thích "tại sao" không)
 */
export const validateQuality = (output: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Kiểm tra độ dài tối thiểu
  if (output.length < 50) {
    errors.push({
      type: "quality",
      message: "Output is too short (minimum 50 characters)",
      severity: "warning",
    });
  }

  // Kiểm tra có giải thích không
  const explanationKeywords = [
    "because",
    "reason",
    "why",
    "explanation",
    "vì",
    "lý do",
    "tại sao",
  ];
  const hasExplanation = explanationKeywords.some((keyword) =>
    output.toLowerCase().includes(keyword)
  );

  if (!hasExplanation) {
    errors.push({
      type: "quality",
      message: "Output lacks clear explanation or reasoning",
      severity: "warning",
    });
  }

  // Kiểm tra có ví dụ không
  const exampleKeywords = ["example", "e.g.", "for instance", "ví dụ"];
  const hasExample = exampleKeywords.some((keyword) =>
    output.toLowerCase().includes(keyword)
  );

  if (!hasExample) {
    errors.push({
      type: "quality",
      message: "Output could benefit from examples",
      severity: "warning",
    });
  }

  return errors;
};

/**
 * Kiểm tra nội dung không phù hợp
 */
export const validateContent = (output: string): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Kiểm tra từ ngữ không phù hợp
  const inappropriateWords = [
    "damn",
    "hell",
    "crap",
    "stupid",
    "idiot",
    "asshole",
  ];
  for (const word of inappropriateWords) {
    if (output.toLowerCase().includes(word)) {
      errors.push({
        type: "accuracy",
        message: `Output contains inappropriate language: "${word}"`,
        severity: "error",
      });
    }
  }

  return errors;
};

// ============================================================================
// MAIN VALIDATION PIPELINE
// ============================================================================

/**
 * Validate chatbot output
 * Pipeline: Scope → Language → Quality → Content
 */
export const validateChatbotOutput = (
  output: string,
  mode: ChatbotMode,
  language: "en" | "vi"
): ValidationResult => {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];

  // 1. Scope validation
  const scopeErrors = validateScope(output, mode);
  errors.push(...scopeErrors);

  // 2. Language validation
  const languageErrors = validateLanguage(output);
  errors.push(...languageErrors);

  // 3. Quality validation
  const qualityErrors = validateQuality(output);
  errors.push(...qualityErrors);

  // 4. Content validation
  const contentErrors = validateContent(output);
  errors.push(...contentErrors);

  // Separate errors and warnings
  const criticalErrors = errors.filter((e) => e.severity === "error");
  const warningsList = errors.filter((e) => e.severity === "warning");

  // Calculate score
  const errorCount = criticalErrors.length;
  const warningCount = warningsList.length;
  const score = Math.max(0, 100 - errorCount * 20 - warningCount * 5);

  return {
    isValid: criticalErrors.length === 0,
    score,
    errors: criticalErrors,
    warnings: warningsList.map((w) => w.message),
    suggestions: generateSuggestions(errors),
  };
};

/**
 * Generate suggestions based on validation errors
 */
const generateSuggestions = (errors: ValidationError[]): string[] => {
  const suggestions: string[] = [];

  if (errors.some((e) => e.type === "scope")) {
    suggestions.push("Ensure your response is related to IELTS learning");
  }

  if (errors.some((e) => e.type === "language")) {
    suggestions.push("Use consistent language (English or Vietnamese)");
  }

  if (errors.some((e) => e.type === "quality")) {
    suggestions.push("Add more detailed explanations and examples");
  }

  if (errors.some((e) => e.type === "accuracy")) {
    suggestions.push("Review content for accuracy and appropriateness");
  }

  return suggestions;
};

/**
 * Create custom validation rule
 */
export const createValidationRule = (
  name: string,
  check: (output: string, context: any) => boolean,
  errorMessage: string,
  severity: "error" | "warning" = "warning"
): ValidationRule => {
  return {
    id: `rule_${Date.now()}`,
    name,
    description: `Custom validation rule: ${name}`,
    check,
    errorMessage,
    severity,
  };
};

