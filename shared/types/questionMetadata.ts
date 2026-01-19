/**
 * Question Metadata Types
 *
 * Defines metadata structures for complex question types (MATCHING, LABELING, ORDERING)
 *
 * ✅ NEW (Shared Pool Architecture):
 * - Labels, items, and targets are stored in separate database tables
 * - Metadata only stores correct answers (pairs/mappings/order)
 * - See docs/shared-pool-design.md for details
 */

/**
 * ⚠️ DEPRECATED: Old metadata structure (kept for backward compatibility)
 * Use MatchingMetadataV2 for new questions
 */
export interface MatchingMetadataLegacy {
  leftItems: Array<{
    id: number;
    text: string;
    order: number;
  }>;
  rightItems: Array<{
    id: number;
    text: string;
    order: number;
  }>;
  correctPairs: Array<{
    leftId: number;
    rightId: number;
  }>;
}

/**
 * ✅ NEW: Metadata for MATCHING questions (Shared Pool Architecture)
 *
 * Labels and items are stored in question_labels and question_items tables.
 * Metadata only stores the correct pairs.
 *
 * Example: Match labels (Present Simple, Past Simple) with items (I eat, I ate)
 */
export interface MatchingMetadataV2 {
  version: 2; // Version marker to distinguish from legacy
  correctPairs: Array<{
    labelId: number; // References question_labels.id
    itemId: number;  // References question_items.id
  }>;
}

/**
 * Union type for backward compatibility
 */
export type MatchingMetadata = MatchingMetadataLegacy | MatchingMetadataV2;

/**
 * ⚠️ DEPRECATED: Old metadata structure (kept for backward compatibility)
 * Use LabelingMetadataV2 for new questions
 */
export interface LabelingMetadataLegacy {
  imageUrl: string;
  imageWidth?: number;
  imageHeight?: number;
  // Positions on the diagram/map where labels should be placed
  positions: Array<{
    id: number;
    name?: string; // Optional name for the position (e.g., "Building A")
    order: number;
    x?: number; // Optional pixel position for visual markers
    y?: number;
  }>;
  // Available labels that can be used
  availableLabels: Array<{
    id: number;
    text: string;
    order: number;
  }>;
  // Correct label assignments
  correctLabels: Array<{
    positionId: number;
    labelId: number;
  }>;
}

/**
 * ✅ NEW: Metadata for LABELING questions (Shared Pool Architecture)
 *
 * Labels and targets are stored in question_labels and question_targets tables.
 * Metadata only stores the correct mappings.
 *
 * Example: Label parts of a diagram (Heart diagram: Aorta, Ventricle, etc.)
 */
export interface LabelingMetadataV2 {
  version: 2; // Version marker to distinguish from legacy
  correctMappings: Array<{
    labelId: number;  // References question_labels.id
    targetId: number; // References question_targets.id
  }>;
}

/**
 * Union type for backward compatibility
 */
export type LabelingMetadata = LabelingMetadataLegacy | LabelingMetadataV2;

/**
 * ⚠️ DEPRECATED: Old metadata structure (kept for backward compatibility)
 * Use OrderingMetadataV2 for new questions
 */
export interface OrderingMetadataLegacy {
  items: Array<{
    id: number;
    text: string;
  }>;
  correctOrder: number[]; // Array of item IDs in correct sequence
}

/**
 * ✅ NEW: Metadata for ORDERING questions (Shared Pool Architecture)
 *
 * Items are stored in question_items table.
 * Metadata only stores the correct order.
 *
 * Example: Arrange steps in chronological order (First, Then, Finally)
 */
export interface OrderingMetadataV2 {
  version: 2; // Version marker to distinguish from legacy
  correctOrder: number[]; // Array of item IDs (from question_items) in correct sequence
}

/**
 * Union type for backward compatibility
 */
export type OrderingMetadata = OrderingMetadataLegacy | OrderingMetadataV2;

/**
 * Metadata for TEXT INPUT questions with additional settings
 */
export interface TextInputMetadata {
  multiline?: boolean;
  maxLength?: number;
  caseSensitive?: boolean;
  acceptableAnswers?: string[];
}

/**
 * Metadata for MULTIPLE CHOICE questions with selection limits
 */
export interface MultipleChoiceMetadata {
  maxSelections?: number;
}

/**
 * Union type for all metadata types
 */
export type QuestionMetadata =
  | MatchingMetadata
  | LabelingMetadata
  | OrderingMetadata
  | TextInputMetadata
  | MultipleChoiceMetadata
  | null;

/**
 * Answer data structures for each question type
 */

export interface SingleChoiceAnswer {
  selectedOptionId: number;
}

export interface MultipleChoiceAnswer {
  selectedOptionIds: number[];
}

export interface TextInputAnswer {
  text: string;
}

export interface MatchingAnswer {
  pairs: Array<{
    leftId: number;
    rightId: number;
  }>;
}

export interface LabelingAnswer {
  labels: Array<{
    positionId: number;
    labelId: number;
  }>;
}

export interface OrderingAnswer {
  order: number[]; // Array of item IDs in user's chosen order
}

/**
 * Union type for all answer types
 */
export type QuestionAnswer = 
  | SingleChoiceAnswer
  | MultipleChoiceAnswer
  | TextInputAnswer
  | MatchingAnswer
  | LabelingAnswer
  | OrderingAnswer;

/**
 * Type guards to check metadata versions
 */
export function isMatchingMetadataV2(metadata: any): metadata is MatchingMetadataV2 {
  return metadata && metadata.version === 2 && Array.isArray(metadata.correctPairs);
}

export function isLabelingMetadataV2(metadata: any): metadata is LabelingMetadataV2 {
  return metadata && metadata.version === 2 && Array.isArray(metadata.correctMappings);
}

export function isOrderingMetadataV2(metadata: any): metadata is OrderingMetadataV2 {
  return metadata && metadata.version === 2 && Array.isArray(metadata.correctOrder);
}

/**
 * Type guards to check answer types
 */
export function isSingleChoiceAnswer(answer: any): answer is SingleChoiceAnswer {
  return answer && typeof answer.selectedOptionId === "number";
}

export function isMultipleChoiceAnswer(answer: any): answer is MultipleChoiceAnswer {
  return answer && Array.isArray(answer.selectedOptionIds);
}

export function isTextInputAnswer(answer: any): answer is TextInputAnswer {
  return answer && typeof answer.text === "string";
}

export function isMatchingAnswer(answer: any): answer is MatchingAnswer {
  return answer && Array.isArray(answer.pairs);
}

export function isLabelingAnswer(answer: any): answer is LabelingAnswer {
  return answer && Array.isArray(answer.labels);
}

export function isOrderingAnswer(answer: any): answer is OrderingAnswer {
  return answer && Array.isArray(answer.order);
}

