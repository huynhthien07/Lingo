/**
 * Chatbot Types and Interfaces
 * 
 * Định nghĩa các kiểu dữ liệu cho Domain-Specific AI Chatbot
 * Nguồn: Mô hình training framework cho IELTS learning platform
 */

// ============================================================================
// 1. TRAINING DATA TYPES
// ============================================================================

/**
 * Training example cho supervised fine-tuning
 * Mỗi example bao gồm input (user message) và output (expected response)
 */
export interface TrainingExample {
  id: string;
  input: string;           // User's question/message
  expectedOutput: string;  // Expected AI response
  category: ChatbotMode;   // Mode: 'multiple-choice' | 'vocabulary' | 'grammar'
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'en' | 'vi';   // Response language
  tags: string[];          // Tags for categorization
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Training dataset cho fine-tuning
 */
export interface TrainingDataset {
  id: string;
  name: string;
  description: string;
  examples: TrainingExample[];
  version: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// 2. CHATBOT MODES
// ============================================================================

export type ChatbotMode = 
  | 'multiple-choice'  // Giải thích câu hỏi trắc nghiệm
  | 'vocabulary'       // Tra cứu từ vựng
  | 'grammar'          // Giải đáp ngữ pháp
  | 'error-analysis'   // Phân tích lỗi sai
  | 'personalized';    // Cá nhân hóa

/**
 * Request cho mỗi mode
 */
export interface MultipleChoiceRequest {
  mode: 'multiple-choice';
  question: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  context?: string;
}

export interface VocabularyRequest {
  mode: 'vocabulary';
  word: string;
  context?: string;
  language: 'en' | 'vi';
}

export interface GrammarRequest {
  mode: 'grammar';
  sentence: string;
  language: 'en' | 'vi';
}

export interface ErrorAnalysisRequest {
  mode: 'error-analysis';
  userText: string;
  errorType: 'grammar' | 'vocabulary' | 'structure';
  language: 'en' | 'vi';
}

export type ChatbotRequest = 
  | MultipleChoiceRequest 
  | VocabularyRequest 
  | GrammarRequest 
  | ErrorAnalysisRequest;

// ============================================================================
// 3. OUTPUT VALIDATION
// ============================================================================

/**
 * Validation result cho output
 */
export interface ValidationResult {
  isValid: boolean;
  score: number;           // 0-100
  errors: ValidationError[];
  warnings: string[];
  suggestions: string[];
}

export interface ValidationError {
  type: 'scope' | 'language' | 'quality' | 'accuracy';
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Output validation rules
 */
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  check: (output: string, context: any) => boolean;
  errorMessage: string;
  severity: 'error' | 'warning';
}

// ============================================================================
// 4. HUMAN FEEDBACK
// ============================================================================

/**
 * User feedback cho improvement
 */
export interface UserFeedback {
  id: string;
  userId: string;
  chatbotResponseId: string;
  rating: 1 | 2 | 3 | 4 | 5;  // 1-5 stars
  isHelpful: boolean;
  comment?: string;
  suggestedCorrection?: string;
  category: ChatbotMode;
  createdAt: Date;
}

/**
 * Feedback aggregation cho training
 */
export interface FeedbackAggregation {
  totalFeedback: number;
  averageRating: number;
  helpfulPercentage: number;
  commonIssues: string[];
  suggestedImprovements: string[];
}

// ============================================================================
// 5. FINE-TUNING
// ============================================================================

/**
 * Fine-tuning job configuration
 */
export interface FineTuningConfig {
  id: string;
  datasetId: string;
  model: string;           // Base model (e.g., 'gpt-3.5-turbo')
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit: number; // 0-1
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Fine-tuning result
 */
export interface FineTuningResult {
  jobId: string;
  modelId: string;
  trainingLoss: number;
  validationLoss: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  completedAt: Date;
}

// ============================================================================
// 6. CHATBOT RESPONSE
// ============================================================================

/**
 * Chatbot response structure
 */
export interface ChatbotResponse {
  id: string;
  mode: ChatbotMode;
  userInput: string;
  response: string;
  explanation?: string;
  examples?: string[];
  relatedTerms?: string[];
  confidence: number;      // 0-1
  validationResult: ValidationResult;
  language: 'en' | 'vi';
  createdAt: Date;
}

// ============================================================================
// 7. SYSTEM CONFIGURATION
// ============================================================================

/**
 * Chatbot system configuration
 */
export interface ChatbotConfig {
  maxResponseLength: number;
  supportedLanguages: ('en' | 'vi')[];
  enabledModes: ChatbotMode[];
  validationRules: ValidationRule[];
  feedbackEnabled: boolean;
  confidenceThreshold: number;  // 0-1
}

