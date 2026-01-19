/**
 * Chatbot Human Feedback Service
 * 
 * Cải thiện chất lượng bằng phản hồi người dùng (Human Feedback)
 * Nguồn: Mô hình training framework cho IELTS learning platform
 * 
 * Quy trình:
 * 1. Thu thập đánh giá từ học viên
 * 2. Phân tích phản hồi
 * 3. Xác định vấn đề phổ biến
 * 4. Tạo training examples từ phản hồi
 * 5. Cải thiện mô hình
 */

import {
  UserFeedback,
  FeedbackAggregation,
  TrainingExample,
  ChatbotMode,
} from "@/lib/types/chatbot.types";

// ============================================================================
// FEEDBACK COLLECTION
// ============================================================================

/**
 * Create user feedback
 */
export const createUserFeedback = (
  userId: string,
  chatbotResponseId: string,
  rating: 1 | 2 | 3 | 4 | 5,
  category: ChatbotMode,
  options?: {
    isHelpful?: boolean;
    comment?: string;
    suggestedCorrection?: string;
  }
): UserFeedback => {
  return {
    id: `feedback_${Date.now()}`,
    userId,
    chatbotResponseId,
    rating,
    isHelpful: options?.isHelpful ?? rating >= 4,
    comment: options?.comment,
    suggestedCorrection: options?.suggestedCorrection,
    category,
    createdAt: new Date(),
  };
};

/**
 * Validate feedback
 */
export const validateFeedback = (
  feedback: UserFeedback
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (feedback.rating < 1 || feedback.rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }

  if (feedback.comment && feedback.comment.length > 500) {
    errors.push("Comment too long (maximum 500 characters)");
  }

  if (
    feedback.suggestedCorrection &&
    feedback.suggestedCorrection.length > 1000
  ) {
    errors.push("Suggested correction too long (maximum 1000 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// FEEDBACK ANALYSIS
// ============================================================================

/**
 * Aggregate feedback data
 */
export const aggregateFeedback = (
  feedbackList: UserFeedback[]
): FeedbackAggregation => {
  if (feedbackList.length === 0) {
    return {
      totalFeedback: 0,
      averageRating: 0,
      helpfulPercentage: 0,
      commonIssues: [],
      suggestedImprovements: [],
    };
  }

  const totalRating = feedbackList.reduce((sum, f) => sum + f.rating, 0);
  const averageRating = totalRating / feedbackList.length;

  const helpfulCount = feedbackList.filter((f) => f.isHelpful).length;
  const helpfulPercentage = (helpfulCount / feedbackList.length) * 100;

  // Extract common issues from comments
  const commonIssues = extractCommonIssues(feedbackList);

  // Extract suggested improvements
  const suggestedImprovements = extractSuggestedImprovements(feedbackList);

  return {
    totalFeedback: feedbackList.length,
    averageRating,
    helpfulPercentage,
    commonIssues,
    suggestedImprovements,
  };
};

/**
 * Extract common issues from feedback comments
 */
const extractCommonIssues = (feedbackList: UserFeedback[]): string[] => {
  const issueKeywords: Record<string, string> = {
    "too short": "Responses are too short",
    "not clear": "Explanations are not clear",
    "no example": "Missing examples",
    "wrong answer": "Incorrect information",
    "confusing": "Confusing explanation",
    "too long": "Responses are too long",
    "not helpful": "Not helpful for learning",
    "grammar error": "Grammar errors in response",
  };

  const issues: Record<string, number> = {};

  for (const feedback of feedbackList) {
    if (!feedback.comment) continue;

    const comment = feedback.comment.toLowerCase();
    for (const [keyword, issue] of Object.entries(issueKeywords)) {
      if (comment.includes(keyword)) {
        issues[issue] = (issues[issue] || 0) + 1;
      }
    }
  }

  // Return top 5 issues
  return Object.entries(issues)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([issue]) => issue);
};

/**
 * Extract suggested improvements
 */
const extractSuggestedImprovements = (
  feedbackList: UserFeedback[]
): string[] => {
  const improvements: string[] = [];

  for (const feedback of feedbackList) {
    if (feedback.suggestedCorrection) {
      improvements.push(feedback.suggestedCorrection);
    }
  }

  // Return unique improvements
  return [...new Set(improvements)].slice(0, 10);
};

// ============================================================================
// FEEDBACK-BASED TRAINING
// ============================================================================

/**
 * Create training examples from feedback
 * Chuyển đổi phản hồi thành training examples để fine-tune
 */
export const createTrainingExamplesFromFeedback = (
  feedbackList: UserFeedback[],
  originalResponses: Map<string, { input: string; output: string }>
): TrainingExample[] => {
  const examples: TrainingExample[] = [];

  for (const feedback of feedbackList) {
    // Chỉ sử dụng feedback có rating thấp (1-2) hoặc có suggested correction
    if (feedback.rating <= 2 || feedback.suggestedCorrection) {
      const originalResponse = originalResponses.get(
        feedback.chatbotResponseId
      );
      if (!originalResponse) continue;

      const example: TrainingExample = {
        id: `ft_${feedback.id}`,
        input: originalResponse.input,
        expectedOutput:
          feedback.suggestedCorrection || originalResponse.output,
        category: feedback.category,
        difficulty: determineDifficulty(feedback.rating),
        language: "en", // Default to English
        tags: ["feedback-based", `rating-${feedback.rating}`],
        createdAt: feedback.createdAt,
        updatedAt: new Date(),
      };

      examples.push(example);
    }
  }

  return examples;
};

/**
 * Determine difficulty from rating
 */
const determineDifficulty = (
  rating: number
): "beginner" | "intermediate" | "advanced" => {
  if (rating <= 2) return "beginner";
  if (rating <= 3) return "intermediate";
  return "advanced";
};

// ============================================================================
// FEEDBACK INSIGHTS
// ============================================================================

/**
 * Generate feedback insights
 */
export const generateFeedbackInsights = (
  aggregation: FeedbackAggregation
): string => {
  const insights: string[] = [];

  // Rating insight
  if (aggregation.averageRating >= 4) {
    insights.push(
      `✅ High satisfaction: Average rating ${aggregation.averageRating.toFixed(2)}/5`
    );
  } else if (aggregation.averageRating >= 3) {
    insights.push(
      `⚠️ Moderate satisfaction: Average rating ${aggregation.averageRating.toFixed(2)}/5`
    );
  } else {
    insights.push(
      `❌ Low satisfaction: Average rating ${aggregation.averageRating.toFixed(2)}/5`
    );
  }

  // Helpful insight
  insights.push(
    `📊 Helpful rate: ${aggregation.helpfulPercentage.toFixed(1)}% of users found responses helpful`
  );

  // Common issues
  if (aggregation.commonIssues.length > 0) {
    insights.push(`\n🔴 Common Issues:`);
    aggregation.commonIssues.forEach((issue, i) => {
      insights.push(`  ${i + 1}. ${issue}`);
    });
  }

  // Suggested improvements
  if (aggregation.suggestedImprovements.length > 0) {
    insights.push(`\n💡 Suggested Improvements:`);
    aggregation.suggestedImprovements.slice(0, 3).forEach((improvement, i) => {
      insights.push(`  ${i + 1}. ${improvement}`);
    });
  }

  return insights.join("\n");
};

/**
 * Determine if retraining is needed
 */
export const shouldRetrain = (aggregation: FeedbackAggregation): boolean => {
  // Retrain if:
  // 1. Average rating < 3.5
  // 2. Helpful percentage < 70%
  // 3. More than 3 common issues
  return (
    aggregation.averageRating < 3.5 ||
    aggregation.helpfulPercentage < 70 ||
    aggregation.commonIssues.length > 3
  );
};

