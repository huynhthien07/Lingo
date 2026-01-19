/**
 * Question Type Mapper
 * 
 * Maps between challenge_type (15+ IELTS-specific types) and question_type (6 core input types)
 * This allows us to have specific IELTS exercise types while using generic UI components
 */

export type QuestionType = 
  | "SINGLE_CHOICE"      // Radio button - select 1 answer
  | "MULTIPLE_CHOICE"    // Checkbox - select multiple answers
  | "TEXT_INPUT"         // Text field - type answer
  | "MATCHING"           // Dropdown/Drag - match pairs
  | "LABELING"           // Drag/Click - label diagram
  | "ORDERING";          // Drag - arrange in order

/**
 * Maps IELTS challenge types to generic question input types
 */
export const CHALLENGE_TO_QUESTION_TYPE_MAP: Record<string, QuestionType> = {
  // LISTENING exercises
  "LISTENING_MULTIPLE_CHOICE": "SINGLE_CHOICE",
  "LISTENING_FORM_COMPLETION": "TEXT_INPUT",
  "LISTENING_MAP_LABELLING": "LABELING",
  "LISTENING_SHORT_ANSWER": "TEXT_INPUT",
  
  // READING exercises
  "READING_MULTIPLE_CHOICE": "SINGLE_CHOICE",
  "READING_TRUE_FALSE_NOT_GIVEN": "SINGLE_CHOICE",
  "READING_MATCHING_HEADINGS": "MATCHING",
  "READING_SENTENCE_COMPLETION": "TEXT_INPUT",
  "READING_SUMMARY_COMPLETION": "TEXT_INPUT",
  
  // WRITING exercises (manual grading)
  "WRITING_TASK_1": "TEXT_INPUT",
  "WRITING_TASK_2": "TEXT_INPUT",
  "WRITING_PRACTICE": "TEXT_INPUT",
  
  // SPEAKING exercises (manual grading)
  "SPEAKING_PART_1": "TEXT_INPUT", // Could be AUDIO_RECORDING in future
  "SPEAKING_PART_2": "TEXT_INPUT",
  "SPEAKING_PART_3": "TEXT_INPUT",
  
  // VOCABULARY & GRAMMAR
  "VOCABULARY": "SINGLE_CHOICE",
  "GRAMMAR": "SINGLE_CHOICE",
};

/**
 * Get question type from challenge type
 */
export function getQuestionTypeFromChallengeType(challengeType: string): QuestionType {
  return CHALLENGE_TO_QUESTION_TYPE_MAP[challengeType] || "TEXT_INPUT";
}

/**
 * Get all challenge types that map to a specific question type
 */
export function getChallengeTypesForQuestionType(questionType: QuestionType): string[] {
  return Object.entries(CHALLENGE_TO_QUESTION_TYPE_MAP)
    .filter(([_, qType]) => qType === questionType)
    .map(([challengeType, _]) => challengeType);
}

/**
 * Check if a challenge type requires options (multiple choice)
 */
export function requiresOptions(challengeType: string): boolean {
  const questionType = getQuestionTypeFromChallengeType(challengeType);
  return questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE";
}

/**
 * Check if a challenge type requires metadata (complex types)
 */
export function requiresMetadata(challengeType: string): boolean {
  const questionType = getQuestionTypeFromChallengeType(challengeType);
  return questionType === "MATCHING" || questionType === "LABELING" || questionType === "ORDERING";
}

/**
 * Check if a challenge type supports images
 */
export function supportsImages(challengeType: string): boolean {
  const questionType = getQuestionTypeFromChallengeType(challengeType);
  return questionType === "SINGLE_CHOICE" || 
         questionType === "MULTIPLE_CHOICE" || 
         questionType === "LABELING";
}

/**
 * Check if a challenge type supports audio
 */
export function supportsAudio(challengeType: string): boolean {
  return challengeType.startsWith("LISTENING_");
}

/**
 * Get default metadata structure for a question type
 */
export function getDefaultMetadata(questionType: QuestionType): any {
  switch (questionType) {
    case "MATCHING":
      return {
        leftItems: [],
        rightItems: [],
        correctPairs: []
      };

    case "LABELING":
      return {
        imageUrl: "",
        positions: [],
        availableLabels: [],
        correctLabels: []
      };

    case "ORDERING":
      return {
        items: [],
        correctOrder: []
      };

    default:
      return null;
  }
}

/**
 * Validate metadata structure
 */
export function validateMetadata(questionType: QuestionType, metadata: any): boolean {
  if (!requiresMetadata(questionType as any)) {
    return true; // No metadata required
  }

  if (!metadata) {
    return false;
  }

  switch (questionType) {
    case "MATCHING":
      return Array.isArray(metadata.leftItems) &&
             Array.isArray(metadata.rightItems) &&
             Array.isArray(metadata.correctPairs);

    case "LABELING":
      return typeof metadata.imageUrl === "string" &&
             Array.isArray(metadata.positions) &&
             Array.isArray(metadata.availableLabels) &&
             Array.isArray(metadata.correctLabels);

    case "ORDERING":
      return Array.isArray(metadata.items) &&
             Array.isArray(metadata.correctOrder);

    default:
      return true;
  }
}

